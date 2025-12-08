# Traffic Core - Blockchain-Based Smart City Traffic Management

**Master IASD 2025/2026 - Blockchain Project**  
**Pr. Ikram BEN ABDEL OUAHAB**

---

## 📋 Project Overview

This project implements the **Traffic Core** subsystem for a decentralized Smart City simulation using **Hyperledger Fabric**. The system manages real-time traffic data, vehicle tracking, and infrastructure coordination through a distributed blockchain network with multiple organizations.

### Key Features
- ✅ Multi-organization blockchain network (4 organizations)
- ✅ Dual-channel architecture for traffic data and administration
- ✅ Raft consensus with 3-node orderer cluster
- ✅ JavaScript-based chaincode for vehicle and traffic management
- ✅ Real-time traffic visualization with interactive map
- ✅ Cross-platform deployment (Windows + WSL Ubuntu)
- ✅ Consensus mechanism experimentation and performance benchmarking

---

## 🏗️ Network Architecture

### Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDERER CLUSTER (Raft)                       │
│  orderer0.example.com  orderer1.example.com  orderer2.example.com│
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼───────┐   ┌────────▼────────┐
│ traffic-channel│   │  admin-channel │   │   Future Channels│
│ (All 4 Orgs)   │   │  (3 Orgs)      │   │                 │
└────────────────┘   └────────────────┘   └─────────────────┘
        │
┌───────┴──────────────────────────────────────────────┐
│                                                       │
▼                  ▼                 ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ TrafficOrg  │  │ CityHallOrg  │  │  PoliceOrg   │  │ EmergencyOrg │
│             │  │              │  │              │  │              │
│ peer0:7051  │  │ peer0:8051   │  │ peer0:9051   │  │ peer0:10051  │
│ peer1:7061  │  │ peer1:8061   │  │ peer1:9061   │  │ peer1:10061  │
└─────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Organizations & MSP Configuration

| Organization Name | MSP ID | Domain | Role |
|-------------------|--------|--------|------|
| **TrafficOrg** | TrafficMSP | traffic.example.com | Traffic monitoring & vehicle tracking |
| **CityHallOrg** | CityHallMSP | cityhall.example.com | Infrastructure management |
| **PoliceOrg** | PoliceMSP | police.example.com | Law enforcement & incident response |
| **EmergencyOrg** | EmergencyMSP | emergency.example.com | Emergency vehicle routing |
| **OrdererOrg** | OrdererMSP | example.com | Transaction ordering service |

### Channels

| Channel Name | Purpose | Members | Chaincode |
|--------------|---------|---------|-----------|
| **traffic-channel** | Real-time traffic data, vehicle positions, traffic events | All 4 Organizations | traffic-contract |
| **admin-channel** | Infrastructure management, road configs, signal control | TrafficOrg, CityHallOrg, PoliceOrg | admin-contract |

### Network Nodes

**Orderers (Raft Consensus):**
- `orderer0.example.com` - Port 7050
- `orderer1.example.com` - Port 7053
- `orderer2.example.com` - Port 7056

**Peers (2 per Organization):**

| Organization | Peer 0 | Peer 1 |
|--------------|--------|--------|
| TrafficOrg | peer0.traffic.example.com:7051 | peer1.traffic.example.com:7061 |
| CityHallOrg | peer0.cityhall.example.com:8051 | peer1.cityhall.example.com:8061 |
| PoliceOrg | peer0.police.example.com:9051 | peer1.police.example.com:9061 |
| EmergencyOrg | peer0.emergency.example.com:10051 | peer1.emergency.example.com:10061 |

### User Identities

Each organization has:
- **Admin User**: `Admin@<org>.example.com` - For channel operations & chaincode deployment
- **Client User**: `User1@<org>.example.com` - For application API interactions

---

## 📦 Project Structure

```
ATELIER1/
├── README.md                          # This file
├── project.md                         # Original project specifications
│
├── network/                           # Hyperledger Fabric network configuration
│   ├── crypto-config.yaml            # Certificate authority configuration
│   ├── configtx.yaml                 # Genesis block & channel configuration
│   ├── docker-compose-orderer.yaml   # Orderer services
│   ├── docker-compose-peers.yaml     # Peer services
│   ├── docker-compose-ca.yaml        # Certificate Authority services
│   ├── connection-profiles/          # Connection profiles for each org
│   │   ├── connection-traffic.json
│   │   ├── connection-cityhall.json
│   │   ├── connection-police.json
│   │   └── connection-emergency.json
│   └── scripts/
│       ├── network.sh                # Master network control script
│       ├── generate-crypto.sh        # Generate certificates
│       ├── generate-genesis.sh       # Create genesis block
│       ├── start-network.sh          # Launch network
│       ├── create-channels.sh        # Create and join channels
│       ├── deploy-chaincode.sh       # Deploy chaincode
│       ├── stop-network.sh           # Stop network
│       └── test-network.sh           # Network validation tests
│
├── chaincode/                         # Smart contracts
│   └── traffic-contract/
│       ├── package.json
│       ├── index.js
│       └── lib/
│           └── trafficContract.js    # Main chaincode logic
│
├── api/                               # REST API Server (Node.js)
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── fabric-config.js
│   ├── controllers/
│   │   ├── vehicleController.js
│   │   └── trafficController.js
│   ├── routes/
│   │   └── api.js
│   └── utils/
│       └── fabricGateway.js
│
├── dashboard/                         # Frontend Dashboard (React)
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Map.js                # Interactive traffic map
│   │   │   ├── VehicleList.js
│   │   │   ├── TrafficStats.js
│   │   │   └── NetworkStatus.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── utils/
│   └── README.md
│
├── simulation/                        # Traffic simulation scripts
│   ├── vehicle-generator.js
│   ├── traffic-patterns.js
│   └── load-test.js
│
├── consensus-experiments/             # Consensus mechanism testing
│   ├── raft-metrics.js
│   ├── pbft-simulation/
│   └── poa-variant/
│
└── docs/                              # Documentation
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    ├── API.md
    └── CONSENSUS_EXPERIMENTS.md
```

---

## 🚀 Technology Stack

### Blockchain Layer
- **Platform**: Hyperledger Fabric 2.5+
- **Consensus**: Raft (EtcdRaft) - 3-node cluster
- **Chaincode Language**: JavaScript (Node.js)
- **Deployment**: Docker & Docker Compose
- **Certificate Management**: Fabric CA

### Application Layer
- **Backend API**: Node.js + Express.js
- **Fabric SDK**: Fabric Network SDK for Node.js
- **Frontend**: React.js
- **Map Integration**: Leaflet.js or Mapbox GL JS
- **Real-time Updates**: WebSocket (Socket.io)
- **State Management**: Redux or Context API

### Development Environment
- **OS**: Windows 11 (Development) + WSL Ubuntu 22.04 (Fabric Network)
- **Container Runtime**: Docker Desktop with WSL2 backend
- **Hyperledger Location**: `~/hyperledger-fabric` (in WSL)

---

## 🔧 Installation & Setup

### Prerequisites

**On Windows:**
```powershell
# Verify WSL is installed
wsl --list --verbose

# Verify Docker Desktop is running
docker --version
docker-compose --version

# Node.js and npm
node --version  # v16+ required
npm --version
```

**In WSL Ubuntu:**
```bash
# Verify Hyperledger Fabric installation
cd ~/hyperledger-fabric
ls -la

# Verify required tools
docker --version
docker-compose --version
```

### Step 1: Clone/Setup Project

```powershell
# Navigate to project directory
cd C:\Users\Asus\Documents\S3\BLOCKCHAIN\ATELIER1

# Install dependencies for API
cd api
npm install

# Install dependencies for Dashboard
cd ..\dashboard
npm install

# Install dependencies for Chaincode
cd ..\chaincode\traffic-contract
npm install
```

### Step 2: Generate Network Artifacts

```powershell
# Access WSL and navigate to project
wsl
cd /mnt/c/Users/Asus/Documents/S3/BLOCKCHAIN/ATELIER1/network

# Generate crypto materials (certificates)
./scripts/generate-crypto.sh

# Generate genesis block and channel artifacts
./scripts/generate-genesis.sh
```

### Step 3: Start the Network

```bash
# In WSL - Start all containers
./scripts/start-network.sh

# Verify all containers are running
docker ps
```

### Step 4: Create Channels

```bash
# Create and join traffic-channel
./scripts/create-channels.sh traffic-channel

# Create and join admin-channel
./scripts/create-channels.sh admin-channel
```

### Step 5: Deploy Chaincode

```bash
# Package, install, and approve chaincode
./scripts/deploy-chaincode.sh traffic-contract 1.0

# Verify chaincode is running
docker ps | grep dev-peer
```

### Step 6: Start Application Services

```powershell
# In Windows PowerShell - Start API Server
cd C:\Users\Asus\Documents\S3\BLOCKCHAIN\ATELIER1\api
npm start
# API runs on http://localhost:3000

# In another terminal - Start Dashboard
cd C:\Users\Asus\Documents\S3\BLOCKCHAIN\ATELIER1\dashboard
npm start
# Dashboard opens at http://localhost:3001
```

---

## 🎯 Smart Contract (Chaincode) Functions

### Traffic Contract API

**Initialize Ledger:**
```javascript
initLedger()
// Initializes the ledger with sample vehicles and intersections
```

**Vehicle Management:**
```javascript
createVehicle(vehicleId, vehicleType, initialPosition, status)
// Creates a new vehicle in the network
// Returns: Vehicle object

updatePosition(vehicleId, newPosition, timestamp, speed)
// Updates vehicle position and movement data
// Returns: Updated vehicle object

queryVehicle(vehicleId)
// Retrieves vehicle details
// Returns: Vehicle object

queryAllVehicles()
// Retrieves all vehicles in the network
// Returns: Array of vehicle objects

deleteVehicle(vehicleId)
// Removes a vehicle from tracking
```

**Traffic Event Management:**
```javascript
recordTrafficEvent(eventId, eventType, location, severity, timestamp)
// Records traffic incidents, congestion, accidents
// Returns: Event object

queryTrafficEvents(startTime, endTime, location)
// Queries traffic events within timeframe/location
// Returns: Array of event objects
```

**Infrastructure Management:**
```javascript
createIntersection(intersectionId, location, signalStatus)
// Creates an intersection node
// Returns: Intersection object

updateSignalStatus(intersectionId, newStatus, timestamp)
// Updates traffic signal state
// Returns: Updated intersection object

queryIntersection(intersectionId)
// Retrieves intersection details
```

**Analytics Functions:**
```javascript
getTrafficDensity(location, radius)
// Calculates vehicle density in area
// Returns: Density metrics

getAverageSpeed(location, radius)
// Calculates average speed in area
// Returns: Speed statistics
```

---

## 🗺️ Dashboard Features

### Interactive Map View
- **Real-time Vehicle Tracking**: Live positions of all vehicles
- **Color-coded Traffic Density**: Green (low), Yellow (moderate), Red (high)
- **Route Visualization**: Historical paths and predicted routes
- **Incident Markers**: Accidents, construction, congestion
- **Intersection Status**: Traffic signal states

### Control Panel
- **Vehicle Management**: Add/remove vehicles, modify parameters
- **Simulation Controls**: Start, pause, speed adjustment
- **Network Configuration**: Add roads, intersections, adjust capacity

### Analytics Dashboard
- **Real-time Metrics**: TPS, block time, latency
- **Traffic Statistics**: Average speed, density heatmaps
- **Transaction History**: Recent blockchain transactions
- **Network Health**: Peer status, orderer status, channel info

### Blockchain Explorer
- **Block Browser**: View block details, transactions
- **Transaction Details**: Chaincode invocations, timestamps
- **Organization View**: Per-org transaction volume

---

## 🔬 Consensus Mechanism Experiments

### Baseline: Raft Consensus
- **Current Configuration**: 3-node orderer cluster
- **Metrics to Collect**:
  - Transaction throughput (TPS)
  - Block finalization time
  - Latency (submission to commit)
  - Resource utilization (CPU, memory)
  - Fault tolerance behavior

### Experiment 1: Modified PBFT
- **Modification**: Implement simplified PBFT with reduced message rounds
- **Implementation Path**: Custom orderer plugin or simulation layer
- **Comparison Points**: Byzantine fault tolerance vs. crash fault tolerance

### Experiment 2: Proof of Authority (PoA) Variant
- **Design**: Reputation-based block validation
- **Authority Nodes**: Designated validators per organization
- **Metrics**: Speed improvement, centralization trade-offs

### Performance Testing Script
```javascript
// simulation/consensus-benchmark.js
// Automated testing framework for consensus comparison
```

### Attack Simulation
- **Data Tampering**: Attempt to modify committed transactions
- **Consensus Violation**: Malicious orderer behavior
- **Network Partition**: Split-brain scenarios
- **Double-spending**: Attempt duplicate transactions

---

## 📊 Performance Metrics

### Target Benchmarks
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Transaction Throughput | 500-1000 TPS | Load testing with vehicle updates |
| Block Time | < 2 seconds | Average time between blocks |
| Transaction Latency | < 500ms | Submit to ledger confirmation |
| Channel Capacity | 10,000+ vehicles | Concurrent entity tracking |

---

## 🧪 Testing

### Network Validation Tests
```bash
# Run comprehensive network tests
cd network/scripts
./test-network.sh
```

### API Integration Tests
```powershell
cd api
npm test
```

### Load Testing
```powershell
cd simulation
node load-test.js --vehicles 1000 --duration 300
```

### Chaincode Unit Tests
```bash
cd chaincode/traffic-contract
npm test
```

---

## 📖 Usage Examples

### Creating a Vehicle via API
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "CAR001",
    "vehicleType": "sedan",
    "position": {"lat": 34.0522, "lng": -118.2437},
    "status": "moving"
  }'
```

### Updating Vehicle Position
```bash
curl -X PUT http://localhost:3000/api/vehicles/CAR001/position \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"lat": 34.0525, "lng": -118.2440},
    "speed": 45,
    "timestamp": "2025-12-08T10:30:00Z"
  }'
```

### Querying Traffic Events
```bash
curl http://localhost:3000/api/traffic/events?location=downtown&startTime=2025-12-08T00:00:00Z
```

---

## 🐛 Troubleshooting

### Common Issues

**Network fails to start:**
```bash
# Check Docker containers
docker ps -a

# View orderer logs
docker logs orderer0.example.com

# View peer logs
docker logs peer0.traffic.example.com

# Restart network
./scripts/stop-network.sh
./scripts/start-network.sh
```

**Chaincode deployment fails:**
```bash
# Check chaincode container logs
docker logs dev-peer0.traffic.example.com-traffic-contract-1.0

# Reinstall chaincode
./scripts/deploy-chaincode.sh traffic-contract 1.1
```

**API cannot connect to network:**
- Verify connection profiles in `api/config/`
- Check peer addresses are accessible from Windows
- Ensure certificates are correctly mounted

**WSL/Windows path issues:**
```powershell
# Convert Windows path to WSL path
wsl wslpath 'C:\Users\Asus\Documents\S3\BLOCKCHAIN\ATELIER1'
# Result: /mnt/c/Users/Asus/Documents/S3/BLOCKCHAIN/ATELIER1
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Detailed system architecture
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Complete deployment guide
- **[API.md](docs/API.md)**: REST API reference
- **[CONSENSUS_EXPERIMENTS.md](docs/CONSENSUS_EXPERIMENTS.md)**: Consensus testing methodology

---

## 🎓 Deliverables Checklist

- [ ] **Technical Report**: Architecture, consensus choice, block structure, results
- [ ] **Source Code**: Complete, commented, version-controlled
- [ ] **Demo Video**: Functional simulation demonstration
- [ ] **Presentation**: 15-minute group presentation
- [ ] **Network Deployment**: Working Hyperledger Fabric network
- [ ] **Chaincode**: JavaScript smart contracts tested and deployed
- [ ] **Dashboard**: Interactive map with real-time traffic visualization
- [ ] **Consensus Experiments**: Performance comparison of 2+ mechanisms
- [ ] **Attack Simulation**: Documented blockchain violation attempts

---

## 👥 Team Members

- [Team Member 1]
- [Team Member 2]
- [Team Member 3]
- [Team Member 4]

**Group Assignment**: Traffic Core (Sous-projet 1)

---

## 📅 Project Timeline

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| **Week 1** | Network setup, crypto generation | 3 days | ⏳ |
| **Week 2** | Chaincode development & testing | 5 days | ⏳ |
| **Week 3** | API server implementation | 4 days | ⏳ |
| **Week 4** | Dashboard development + map integration | 5 days | ⏳ |
| **Week 5** | Consensus experiments & benchmarking | 4 days | ⏳ |
| **Week 6** | Testing, documentation, video | 4 days | ⏳ |

---

## 🔗 Useful Resources

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Samples](https://github.com/hyperledger/fabric-samples)
- [Fabric SDK Node.js](https://hyperledger.github.io/fabric-sdk-node/)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [Docker Documentation](https://docs.docker.com/)

---

## 📄 License

This project is part of academic coursework for Master IASD 2025/2026.

---

## 🆘 Support

For questions or issues:
- **Professor**: Pr. Ikram BEN ABDEL OUAHAB
- **Project Issues**: [Create an issue in the repository]
- **Team Communication**: [Your team communication channel]

---

**Last Updated**: December 8, 2025
