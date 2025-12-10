# Traffic Core - Smart City Traffic Management Blockchain

A decentralized traffic management system for smart cities using Hyperledger Fabric.

## 🚗 Project Overview

This project implements a blockchain-based traffic coordination system where multiple organizations (Traffic Authority, Vehicle Operators, Infrastructure Operators, Emergency Services, and Parking Management) collaborate to manage urban traffic efficiently and transparently.

## 🏗️ Architecture

### Organizations (6 total)
- **Traffic Authority**: Manages global traffic rules and governance (2 peers)
- **Vehicle Operator**: Represents vehicles, taxis, buses (2 peers)
- **Infrastructure Operator**: Road sensors, cameras, IoT gateways (2 peers)
- **Emergency Services**: Priority operations and alerts (2 peers)
- **Parking Management**: Parking reservations and slot management (2 peers)
- **OrdererOrg**: RAFT consensus orderers (3 orderers)

### Channels (2)
1. **city-traffic-global**: Main channel for all traffic coordination (all 5 peer orgs)
2. **emergency-channel**: Priority channel for emergency operations (3 orgs)

### Technology Stack
- **Blockchain**: Hyperledger Fabric 2.5+
- **Chaincode**: JavaScript (Node.js)
- **Backend**: Node.js + Express + Fabric Node SDK
- **Frontend**: React + Vite + Leaflet Maps
- **Real-time**: Socket.io
- **Database**: CouchDB (state database)
- **Containers**: Docker

## 📁 Project Structure

```
ATELIER1/
├── network/                     # Hyperledger Fabric network configurations
│   ├── organizations/          # Crypto materials and MSP
│   │   ├── cryptogen/         # Cryptogen config files
│   │   ├── ordererOrganizations/
│   │   └── peerOrganizations/
│   ├── configtx/              # Channel configurations
│   ├── docker/                # Docker compose files
│   ├── scripts/               # Network deployment scripts
│   ├── channel-artifacts/     # Generated channel artifacts
│   └── system-genesis-block/  # Genesis block
│
├── chaincode/                  # Smart contracts
│   ├── traffic-contract/      # Main traffic chaincode (JavaScript)
│   └── emergency-contract/    # Emergency operations chaincode
│
├── application/                # Client applications
│   ├── backend/               # Node.js REST API
│   │   └── src/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── fabric-sdk/    # Fabric SDK integration
│   │       ├── routes/
│   │       └── config/
│   └── frontend/              # React dashboard
│       ├── public/
│       └── src/
│           ├── components/
│           ├── services/
│           ├── maps/          # Map integration
│           └── assets/
│
├── simulator/                  # Traffic simulation engine
│   └── vehicle-simulator/
│
├── test/                      # Testing
│   ├── unit-tests/
│   ├── integration-tests/
│   └── attack-simulations/
│
└── docs/                      # Documentation
```

## 🚀 Prerequisites

### Required Software
- **Ubuntu 22.04** (via WSL on Windows)
- **Docker Desktop** with WSL2 integration
- **Node.js 18+**
- **Hyperledger Fabric 2.5+** (installed in `~/hyperledger-fabric` on WSL)
- **Git**

### Windows + WSL Setup
This project uses a hybrid environment:
- **WSL Ubuntu 22.04**: Runs Hyperledger Fabric blockchain network
- **Windows**: Development environment for code editing and running applications
- **Docker Desktop**: Bridges both environments

## 📦 Installation

### Step 1: Clone Repository
```powershell
# Already done - you're in this repository!
cd c:\Users\Asus\Documents\S3\BLOCKCHAIN\ATELIER1
```

### Step 2: Setup Hyperledger Fabric Network (WSL)
```powershell
# Access WSL Ubuntu
wsl -d Ubuntu-22.04

# Navigate to Hyperledger installation
cd ~/hyperledger-fabric

# Copy network configuration from Windows to WSL
# (Instructions will be provided in Phase 2)
```

### Step 3: Install Dependencies

#### Backend
```powershell
cd application/backend
npm install
```

#### Frontend
```powershell
cd application/frontend
npm install
```

#### Chaincode (on WSL)
```bash
cd chaincode/traffic-contract
npm install

cd ../emergency-contract
npm install
```

## 🔧 Configuration

Configuration files will be created during Phase 2-3:
- Network topology: `network/configtx/configtx.yaml`
- Crypto configuration: `network/organizations/cryptogen/crypto-config.yaml`
- Docker services: `network/docker/docker-compose-*.yaml`
- Connection profiles: `application/backend/src/config/connection-*.json`

## 🎯 Usage

### Start the Network
```bash
# On WSL Ubuntu
cd ~/hyperledger-fabric/network
./scripts/network.sh up
./scripts/network.sh createChannel
./scripts/network.sh deployCC
```

### Start Backend API
```powershell
# On Windows
cd application/backend
npm run dev
```

### Start Frontend Dashboard
```powershell
# On Windows
cd application/frontend
npm run dev
```

### Start Traffic Simulator
```powershell
# On Windows
cd simulator/vehicle-simulator
node simulator.js
```

## 🧪 Features

### Smart Contracts
- **Traffic Contract**: Vehicle registration, position updates, intersection management, traffic density monitoring
- **Emergency Contract**: Incident management, priority routing, traffic signal override, emergency alerts

### Dashboard
- Real-time traffic visualization on realistic map (Leaflet + OpenStreetMap)
- Vehicle tracking and movement
- Intersection signal states
- Emergency incident markers
- Parking availability
- Transaction log viewer
- Consensus performance metrics
- Attack simulation controls

### Consensus Experimentation
- RAFT (baseline)
- Modified PBFT implementation
- Proof of Authority (PoA) simulation
- Performance comparison metrics

### Security Features
- Attack simulation: Data falsification, double-spending, replay attacks, consensus attacks, Sybil attacks
- Immutability demonstration
- CA-based identity management

## 📊 Performance Metrics

The system tracks and compares:
- Transactions per second (TPS)
- Block creation time
- Transaction latency
- Network message overhead
- Resource usage (CPU/Memory)
- Fault tolerance capabilities

## 🔐 Security

- Certificate Authority (CA) for each organization
- MSP-based identity management
- Channel-based access control
- Endorsement policies for transaction validation
- Immutable ledger with cryptographic hashing

## 📖 Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Complete 19-day development plan
- [Project Specification](project.md) - Detailed requirements and architecture
- API Documentation - Coming in Phase 4
- Deployment Guide - Coming in Phase 2

## 👥 Team

**Course**: Master IASD - Blockchain 2025/2026  
**Professor**: Pr. Ikram BEN ABDEL OUAHAB  
**Sub-Project**: Traffic Core  

## 📝 Deliverables

- [x] Project structure setup
- [ ] Hyperledger Fabric network deployment
- [ ] JavaScript chaincodes (traffic + emergency)
- [ ] Backend REST API with Fabric SDK
- [ ] Frontend dashboard with map integration
- [ ] Traffic simulator
- [ ] Consensus experimentation
- [ ] Attack simulation
- [ ] Technical report
- [ ] Video demonstration (15 min)
- [ ] Oral presentation

## 🛣️ Roadmap

- **Phase 1**: ✅ Project structure (Completed)
- **Phase 2**: Network configuration (In Progress)
- **Phase 3**: Chaincode development
- **Phase 4**: Backend API
- **Phase 5**: Frontend dashboard
- **Phase 6**: Traffic simulator
- **Phase 7**: Consensus experimentation
- **Phase 8**: Attack simulation
- **Phase 9**: Testing & validation
- **Phase 10**: Documentation & demo

## 📄 License

This is an academic project for educational purposes.

## 🤝 Contributing

This is a course project. Team members can create branches and submit pull requests for review.

## 📧 Contact

For questions or issues, contact the project team or course instructor.

---

**Status**: Phase 1 Complete ✅ | Phase 2 In Progress 🚧
