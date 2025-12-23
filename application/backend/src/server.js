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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/traffic', trafficRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/consensus', require('./routes/consensus'));

// Health check with Fabric Status
app.get('/health', async (req, res) => {
    let fabricStatus = 'disconnected';
    try {
        if (fabricClient.gateway) {
            fabricStatus = 'connected';
            // Try simple query
            // const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            // await contract.evaluateTransaction('getTrafficStatistics');
        }
    } catch (e) {
        fabricStatus = 'error: ' + e.message;
    }

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        fabric: fabricStatus
    });
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
        // await fabricClient.initialize(); // Let's try-catch this explicitly inside

        try {
            await fabricClient.initialize();
            console.log('✓ Fabric Client connected successfully.');
        } catch (err) {
            console.error('❌ Fabric Client Initialization FAILED:', err.message);
            console.error('Stack:', err.stack);
            // Don't exit, let the server run so we can debug via API
        }

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`✓ Server running on port ${PORT} (0.0.0.0)`);
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
