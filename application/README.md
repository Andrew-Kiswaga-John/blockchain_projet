# Smart City Traffic Core - Dashboard Setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed on Windows
- Hyperledger Fabric network running in WSL
- Emergency-ops channel deployed

### Backend Setup

```bash
# Navigate to backend
cd application/backend

# Install dependencies
npm install

# Start the server
npm start
```

The backend will run on **http://localhost:3000**

### Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd application/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will open at **http://localhost:5173**

## 📊 Features

### Map View
- Real-time vehicle positions
- Emergency incident markers
- Interactive popups with details
- Geographic visualization

### Statistics
- Traffic metrics
- Emergency statistics
- Blockchain transaction data

### Controls
- Add random vehicles to simulation
- Trigger emergency scenarios
- View network information

## 🔧 Configuration

Edit `backend/.env` to configure:
- Network paths
- Channel names
- Organization details
- API ports

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↕
Backend (Express + Socket.IO)
    ↕
Hyperledger Fabric SDK
    ↕
Blockchain Network (WSL)
```

## 📝 API Endpoints

### Traffic API
- `GET /api/traffic/vehicles` - Get all vehicles
- `POST /api/traffic/vehicles/register` - Register vehicle
- `PUT /api/traffic/vehicles/position` - Update position
- `GET /api/traffic/statistics` - Get traffic stats

### Emergency API
- `GET /api/emergency/statistics` - Get emergency stats
- `POST /api/emergency/create` - Create emergency
- `GET /api/emergency/active` - Get active emergencies

## 🧪 Testing

1. Start the backend and frontend
2. Open dashboard at http://localhost:5173
3. Go to "Controls" tab
4. Click "Add Random Vehicle" to simulate traffic
5. Click "Trigger Emergency" to create emergency scenario
6. View results on "Map View" tab

## 🐛 Troubleshooting

**Backend fails to connect:**
- Ensure Hyperledger Fabric network is running in WSL
- Check network paths in `.env` match your WSL setup
- Verify channels exist: `city-traffic-global` and `emergency-ops`

**Frontend can't reach backend:**
- Check backend is running on port 3000
- Verify no firewall blocking localhost connections

**Map not loading:**
- Check internet connection (needs OpenStreetMap tiles)
- Ensure Leaflet CSS is loaded

## 📚 Next Steps

1. ✅ Basic dashboard working
2. 🔄 Add vehicle movement simulation
3. 🔄 Implement traffic density heatmap
4. 🔄 Add intersection signal controls
5. 🔄 Implement attack simulation scenarios
