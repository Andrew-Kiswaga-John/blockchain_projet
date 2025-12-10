# Project Structure

## Overview
This document describes the folder structure and organization of the Traffic Core blockchain project.

## Directory Layout

### `/network` - Blockchain Network Configuration
Contains all Hyperledger Fabric network setup files.

- **`/organizations`**: Crypto materials and MSP configurations
  - `/cryptogen`: Cryptogen configuration files
  - `/ordererOrganizations`: Orderer crypto materials
  - `/peerOrganizations`: Peer organization crypto materials

- **`/configtx`**: Channel configuration files
  - `configtx.yaml`: Defines organizations, orderer, and channel profiles

- **`/docker`**: Docker Compose configurations
  - Docker files for orderers, peers, and CAs

- **`/scripts`**: Network deployment and management scripts
  - Network startup/shutdown scripts
  - Channel creation scripts
  - Chaincode deployment scripts

- **`/channel-artifacts`**: Generated channel artifacts
  - Genesis blocks, channel transactions

- **`/system-genesis-block`**: System genesis block storage

### `/chaincode` - Smart Contracts
JavaScript smart contracts for the blockchain.

- **`/traffic-contract`**: Main traffic management chaincode
  - `/lib`: Contract implementation
  - Vehicle, intersection, traffic density management

- **`/emergency-contract`**: Emergency operations chaincode
  - `/lib`: Contract implementation
  - Incident management, priority routing

### `/application` - Client Applications

#### `/backend` - Node.js REST API
- **`/src/controllers`**: Request handlers
- **`/src/services`**: Business logic
- **`/src/fabric-sdk`**: Blockchain integration
- **`/src/routes`**: API endpoints
- **`/src/config`**: Configuration files

#### `/frontend` - React Dashboard
- **`/public`**: Static assets
- **`/src/components`**: React components
- **`/src/services`**: API client services
- **`/src/maps`**: Map integration logic
- **`/src/assets`**: Images, icons, styles

### `/simulator` - Traffic Simulation
Vehicle movement simulation engine.

- **`/vehicle-simulator`**: Traffic simulator implementation

### `/test` - Testing
Test suites and attack simulations.

- **`/unit-tests`**: Unit tests for components
- **`/integration-tests`**: End-to-end tests
- **`/attack-simulations`**: Security testing scenarios

### `/docs` - Documentation
Project documentation and guides.

## File Naming Conventions

- Configuration files: `kebab-case.yaml`
- JavaScript files: `camelCase.js`
- React components: `PascalCase.jsx`
- Scripts: `kebab-case.sh`

## Next Steps

Phase 2 will populate these directories with actual configuration files and code.
