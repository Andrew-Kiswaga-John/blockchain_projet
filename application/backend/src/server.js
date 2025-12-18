const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const fabricClient = require('./fabric-sdk/fabricClient');
const trafficRoutes = require('./routes/traffic');
const emergencyRoutes = require('./routes/emergency');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/traffic', trafficRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Vehicle position updates
    socket.on('vehicle:update', async (data) => {
        try {
            // Broadcast to all other clients
            socket.broadcast.emit('vehicle:position', data);
        } catch (error) {
            console.error('Error broadcasting vehicle update:', error);
        }
    });

    // Emergency alerts
    socket.on('emergency:alert', (data) => {
        io.emit('emergency:new', data);
    });
});

// Initialize Fabric client
async function init() {
    try {
        console.log('🚀 Starting Traffic Core Backend...');
        await fabricClient.initialize();
        
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ WebSocket server active`);
            console.log(`✓ API: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

init();

module.exports = { app, io };
