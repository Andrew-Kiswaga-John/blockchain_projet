# Traffic Core Blockchain - Project Status Report

**Project:** Smart City Decentralized Simulator - Traffic Core Subsystem  
**Date:** December 8, 2025  
**Status:** Network Operational, Core Functions Working, Consensus Experimentation Pending

---

## What We've Built So Far

### 1. Complete Hyperledger Fabric Network Infrastructure

We've deployed a fully functional multi-organization blockchain network with the following architecture:

**Organizations:**
- **TrafficMSP**: Main traffic management authority with 2 peers (ports 7051, 7061) and 1 CA (7054)
- **CityHallMSP**: Municipal government entity with 2 peers (ports 8051, 8061) and 1 CA (8054)
- **PoliceMSP**: Law enforcement with 2 peers (ports 9051, 9061) and 1 CA (9054)
- **EmergencyMSP**: Emergency services with 2 peers (ports 10051, 10061) and 1 CA (10054)
- **OrdererMSP**: Ordering service organization with 1 CA (11054)

**Consensus Layer:**
- 3 Raft orderers (orderer0, orderer1, orderer2) running on ports 7050, 8050, 9050
- All orderers communicate internally on port 7050 within Docker network
- Using Hyperledger Fabric 2.2 images (downgraded from latest to avoid gRPC ALPN TLS enforcement issues)

**Communication Channels:**
- **traffic-channel**: Shared by all 4 peer organizations for general traffic data
- **admin-channel**: Shared by TrafficMSP, CityHallMSP, and PoliceMSP for administrative operations

**Total Infrastructure:**
- 16 Docker containers running simultaneously
- 8 peer nodes (2 per organization)
- 3 Raft orderer nodes
- 5 Certificate Authority nodes
- Complete TLS encryption for all communications

### 2. Smart Contract (Chaincode) Implementation

Deployed **traffic-contract v1.2** (sequence 3) with the following capabilities:

**Core Data Models:**
- **Vehicle**: vehicleId, vehicleType, position (lat/lng), speed, status, owner, timestamp
- **Intersection**: intersectionId, location (lat/lng), signalStatus, lastUpdate
- **Traffic Event**: eventId, eventType, location, severity, description, reportedBy, timestamp, status

**Implemented Functions:**
- `initLedger()`: Initialize blockchain with sample data (4 vehicles, 2 intersections)
- `createVehicle(vehicleId, vehicleType, lat, lng, speed, status, owner)`: Register new vehicles
- `updatePosition(vehicleId, lat, lng, speed)`: Update vehicle location and speed in real-time
- `queryVehicle(vehicleId)`: Retrieve specific vehicle data
- `queryAllVehicles()`: Get all registered vehicles
- `createIntersection(intersectionId, lat, lng, signalStatus)`: Register traffic intersections
- `updateSignalStatus(intersectionId, newStatus)`: Change traffic light states
- `queryIntersection(intersectionId)`: Get intersection details
- `queryAllIntersections()`: List all intersections
- `recordTrafficEvent(eventId, eventType, lat, lng, severity, description, reportedBy)`: Log incidents
- `resolveTrafficEvent(eventId)`: Mark events as resolved
- `queryTrafficEvent(eventId)`: Get event details
- `queryAllTrafficEvents()`: List all events
- `getVehicleHistory(vehicleId)`: Track vehicle movement history
- `getEventsByLocation(lat, lng, radius)`: Find events near coordinates

**Critical Technical Achievement - Deterministic Execution:**
We encountered and solved a fundamental blockchain issue: non-deterministic timestamps were causing endorsement failures. Different peers executing the same transaction at slightly different times (milliseconds apart) would generate different `new Date()` values, resulting in mismatched proposal responses. This violated the endorsement policy requirement that all peers must produce identical results.

**Solution:** Replaced all `new Date().toISOString()` calls with `new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()`. This ensures all peers use the blockchain's transaction timestamp rather than their system clocks, guaranteeing deterministic execution across the network.

### 3. Network Configuration and Deployment

**Endorsement Policy:**
The network requires 3 out of 4 organizations to endorse any transaction on traffic-channel. This ensures:
- No single organization can unilaterally modify data
- Byzantine fault tolerance against up to 1 malicious organization
- Democratic consensus for all state changes

**Cryptographic Setup:**
- Complete MSP (Membership Service Provider) configurations for all organizations
- TLS certificates for encrypted peer-to-peer communication
- Admin certificates for privileged operations
- User certificates for transaction signing

**Channel Configuration (configtx.yaml):**
- Defined application capabilities and policies
- Configured Raft consensus parameters (block timeout, message count, batch size)
- Established orderer endpoints with proper port mappings
- Set up channel-specific endorsement policies

### 4. Deployment Scripts and Automation

Created comprehensive bash scripts for network management:

**Network Lifecycle:**
- `start-network.sh`: Brings up all Docker containers in correct order
- `stop-network.sh`: Gracefully shuts down the network
- `generate-crypto.sh`: Creates all certificates and keys using cryptogen

**Channel Management:**
- `create-channel.sh`: Generates genesis blocks and channel artifacts using configtxgen
- `join-channel.sh`: Connects all peers to their respective channels

**Chaincode Operations:**
- `deploy-chaincode.sh`: Packages, installs, approves, and commits chaincode with variable sequence support
- `approve-upgrade.sh`: Handles chaincode version upgrades
- `test-chaincode.sh`: Comprehensive test suite for all 11 chaincode operations

### 5. Testing and Validation

Successfully validated all functionality through the test suite:

**Query Operations Tested:**
- Querying all vehicles returns 4 initialized records with correct Casablanca coordinates
- Querying specific vehicles by ID works correctly
- Querying all intersections returns 2 traffic signals
- Querying traffic events retrieves logged incidents

**Invoke Operations Tested:**
- Updating vehicle positions with new coordinates and speeds
- Creating new vehicles dynamically (tested with VEH999 motorcycle)
- Recording traffic events (accidents, congestion, road closures)
- Updating intersection signal states (green → yellow → red)
- All invokes receive endorsements from 3+ peer organizations

**Performance Observations:**
- Transaction latency: ~2-3 seconds per invoke
- Query latency: <1 second
- Consistent results across multiple peer endorsements
- No timeout errors or consensus failures

### 6. Problem Resolution Journey

Throughout development, we encountered and resolved several critical issues:

**Issue 1: gRPC ALPN Protocol Negotiation Failures**
- Problem: Fabric latest images enforce ALPN protocol, causing "transport: authentication handshake failed" errors
- Solution: Downgraded to Fabric 2.2 images with `GODEBUG=x509ignoreCN=0,netdns=go` environment variables

**Issue 2: Orderer Port Configuration**
- Problem: configtx.yaml had inconsistent orderer ports (7050, 8050, 9050)
- Explanation: Internal Docker network communication requires all orderers to listen on the same port
- Solution: Set all consenters to use port 7050 internally, with external port mappings handled by Docker

**Issue 3: Endorsement Policy Failures**
- Problem: Initial invokes failed with "2 sub-policies satisfied, but requires 3"
- Solution: Modified invoke commands to include peer addresses from 3+ organizations using `--peerAddresses` flags

**Issue 4: Non-Deterministic Chaincode**
- Problem: ProposalResponsePayloads mismatch due to different timestamps across peers
- Root Cause: Each peer's `new Date()` generated unique millisecond values
- Solution: Implemented deterministic timestamp using transaction timestamp from blockchain

**Issue 5: Function Signature Mismatches**
- Problem: Test script revealed parameter count errors (expected 5 but got 7, etc.)
- Solution: Aligned function signatures between chaincode implementation and invocation calls

**Issue 6: Sequence Number Management**
- Problem: Chaincode upgrade attempted to use sequence 1 when already at sequence 2
- Solution: Modified deploy script to accept sequence as parameter, deployed v1.2 with sequence 3

---

## What's Been Configured vs. What's Been Implemented

**Blockchain Infrastructure: Fully Implemented**
The network runs with actual Docker containers, real peer nodes, functioning orderers, and operational CAs. This isn't just configuration files—the network is live and processing transactions.

**Chaincode: Fully Implemented and Deployed**
The JavaScript smart contract is running on all 8 peer nodes in Docker containers. It's not theoretical code—it's executing transactions and storing data in the blockchain ledger.

**Data: Real and Queryable**
The ledger contains actual data: 4 vehicles moving through Casablanca (coordinates 33.57° N, 7.59° W), 2 traffic intersections with signal states, and traffic events. This data persists across the blockchain.

**Consensus: Working with Raft**
The 3-orderer Raft cluster is actively ordering transactions, maintaining the blockchain, and ensuring all peers stay synchronized. Block creation, transaction validation, and state synchronization are happening in real-time.

---

## What Remains to Be Done

### Critical Requirements from Project Specification

**1. Consensus Mechanism Experimentation (HIGH PRIORITY)**

Your project explicitly requires: *"Expérimenter 2 nouveaux mécanismes de consensus (ex. PBFT modifié, PoA, consensus par vote temporel)"* and *"Comparer la performance de ces consensus avec des métriques bien déterminées"*.

**Current State:** We're using the standard Raft consensus that comes with Hyperledger Fabric.

**What's Needed:**
- Select 2 alternative consensus mechanisms to implement. Options include:
  - **Modified PBFT** (Practical Byzantine Fault Tolerance with custom modifications)
  - **PoA** (Proof of Authority with designated validators)
  - **Temporal Voting Consensus** (time-based voting mechanism)
  - **Custom Hybrid Consensus** (combination of approaches)

- Implement these consensus mechanisms. This could involve:
  - Creating custom orderer implementations
  - Modifying Fabric's consensus interface
  - Building external consensus layers that integrate with Fabric
  - Using pluggable consensus frameworks

- Establish performance baseline with current Raft setup:
  - Measure transaction throughput (TPS)
  - Measure latency (time from submit to commit)
  - Measure finality time (when transaction is considered irreversible)
  - Measure CPU and memory resource usage
  - Test under various load conditions

- Deploy alternative consensus mechanisms and collect identical metrics

- Create comprehensive comparison analysis:
  - Throughput comparison table
  - Latency distribution graphs
  - Resource utilization comparison
  - Fault tolerance characteristics
  - Security properties of each mechanism
  - Trade-offs analysis

**Why This Is Critical:** This is the core academic contribution of your project. Without implementing and comparing new consensus mechanisms, you're only demonstrating a standard Hyperledger Fabric deployment, not conducting the research your project requires.

**2. Interactive Dashboard with Map Integration**

The specification requires: *"integrate a realistic map to the dashboard to simulate the traffic"*.

**Current State:** No dashboard exists. All interaction happens through command-line peer invocations.

**What's Needed:**
- Build a web-based dashboard using React or Vue.js
- Integrate a mapping library (Leaflet, Mapbox, or Google Maps)
- Display Casablanca city map with realistic road network
- Visualize vehicles as moving markers on the map
- Show intersection locations with color-coded traffic signals
- Display traffic events as overlay icons
- Provide real-time updates by querying the blockchain

**Implementation Approach:**
- Create a Node.js backend server using Fabric SDK
- Connect to blockchain network via connection profiles
- Expose REST API endpoints for dashboard to consume
- Build frontend with map component
- Implement WebSocket for real-time updates
- Style with traffic management theme

**3. Vehicle Movement Simulation**

**Current State:** Vehicles are static entries in the ledger. Position updates only happen when manually invoked.

**What's Needed:**
- Implement automated vehicle movement algorithm
- Calculate realistic paths along Casablanca's road network
- Respect traffic rules (follow roads, stop at red lights)
- Simulate different vehicle behaviors:
  - Sedans: moderate speed, frequent stops
  - Trucks: slower speed, limited routes
  - Buses: scheduled stops along routes
  - Emergency vehicles: priority movement
- Continuously update blockchain with new positions
- Generate traffic patterns (rush hour congestion, accidents causing slowdowns)

**Implementation Approach:**
- Create a simulation engine (separate Node.js service)
- Use routing algorithms (Dijkstra, A*) for path planning
- Invoke `updatePosition()` chaincode function at regular intervals
- Simulate traffic density affecting speeds
- Create event triggers (accidents, road closures)

**4. Dynamic Traffic Management Parameters**

The specification mentions: *"des paramètres réglables (densité du trafic, règles de priorité, probabilité d'incident)"*.

**Current State:** No configurable parameters exist.

**What's Needed:**
- Create configuration interface for:
  - Traffic density (number of active vehicles)
  - Priority rules (emergency vehicle preferences)
  - Incident probability (frequency of accidents/events)
  - Signal timing algorithms
  - Speed limits by road type
- Implement parameter adjustment mechanisms
- Demonstrate how parameter changes affect network behavior
- Show consensus mechanism performance under different parameters

**5. Security and Attack Demonstrations**

The specification requires: *"démonstrations de sécurité (falsification de données, détection d'incohérences)"*.

**Current State:** Security exists through endorsement policies, but no demonstrations of attacks.

**What's Needed:**
- Demonstrate data falsification attempts:
  - Try to modify vehicle position without proper endorsement
  - Attempt to change traffic signals without authorization
  - Show how blockchain rejects invalid transactions
- Show Byzantine fault scenarios:
  - Simulate a malicious peer providing false data
  - Demonstrate how endorsement policy prevents corruption
  - Show the network's resilience to compromised nodes
- Implement anomaly detection:
  - Detect impossible vehicle movements (teleportation)
  - Identify signal timing violations
  - Flag suspicious patterns in traffic data
- Document how each consensus mechanism handles these attacks differently

**6. Performance Analysis and Metrics**

**What's Needed:**
- Develop comprehensive benchmarking suite
- Measure metrics under controlled conditions:
  - Varying transaction rates (10, 50, 100, 500 TPS)
  - Different network sizes (add/remove peers)
  - Simulated network latency and packet loss
  - Concurrent user scenarios
- Generate performance reports with:
  - Transaction latency histograms
  - Throughput over time graphs
  - Resource utilization charts
  - Consensus comparison matrices
- Analyze results to identify optimal configurations

**7. Documentation and Reporting**

**What's Needed:**
- Technical architecture documentation:
  - Network topology diagrams
  - Data flow diagrams
  - Sequence diagrams for key operations
  - Consensus mechanism detailed explanations
- User guide for dashboard operation
- Developer guide for extending the system
- Academic report including:
  - Introduction and motivation
  - Literature review on blockchain consensus
  - Methodology for implementation and testing
  - Results and analysis
  - Conclusions and future work
- Code comments and API documentation

---

## Technical Debt and Future Enhancements

**Current Limitations:**

1. **Single Channel Focus:** While we created two channels, all testing and development focuses on traffic-channel. The admin-channel remains unused and could be leveraged for administrative operations.

2. **No Data Persistence Strategy:** If Docker containers are removed, all blockchain data is lost. Production systems would need persistent volumes.

3. **Limited Error Handling:** Chaincode has basic error handling but could be more robust with detailed error messages and recovery mechanisms.

4. **No Monitoring:** No logging, metrics collection, or observability tools are integrated. Production deployments would need Prometheus, Grafana, or similar tools.

5. **Security Hardening:** While TLS is enabled and endorsement policies are set, additional security measures could include:
   - Rate limiting on API endpoints
   - Input validation and sanitization
   - Audit logging of all operations
   - Key rotation mechanisms

6. **Scalability:** Current network is fixed at 4 organizations. Dynamic organization addition/removal isn't implemented.

**Enhancement Opportunities:**

1. **Mobile Application:** Extend dashboard with mobile app for traffic participants
2. **Integration with IoT Devices:** Connect real traffic sensors and cameras
3. **Machine Learning:** Predict traffic patterns and optimize signal timing
4. **Multi-City Support:** Extend beyond Casablanca to other cities
5. **Advanced Analytics:** Historical trend analysis and reporting
6. **Public API:** Allow third-party applications to query traffic data

---

## Immediate Next Steps (Recommended Priority Order)

**Phase 1: Consensus Experimentation Setup (Week 1-2)**
1. Research and select 2 consensus mechanisms to implement
2. Establish Raft performance baseline with current network
3. Design implementation approach for alternative consensus
4. Begin implementation of first alternative mechanism

**Phase 2: Alternative Consensus Implementation (Week 2-3)**
1. Complete first alternative consensus mechanism
2. Deploy and test with current chaincode
3. Implement second alternative consensus mechanism
4. Deploy and validate

**Phase 3: Performance Analysis (Week 3-4)**
1. Develop automated benchmarking tools
2. Run comprehensive tests on all 3 consensus mechanisms
3. Collect and analyze performance data
4. Generate comparison reports and visualizations

**Phase 4: Dashboard Development (Week 4-5)**
1. Set up React/Vue.js project structure
2. Integrate map library with Casablanca base map
3. Build Fabric SDK connection layer
4. Implement real-time data visualization
5. Add controls for simulation parameters

**Phase 5: Simulation Engine (Week 5-6)**
1. Implement vehicle movement algorithms
2. Create traffic pattern generators
3. Integrate with blockchain for state updates
4. Test under various scenarios

**Phase 6: Security Demonstrations (Week 6)**
1. Design attack scenarios
2. Implement attack simulations
3. Document defense mechanisms
4. Create demonstration scripts

**Phase 7: Documentation and Reporting (Week 7)**
1. Complete technical documentation
2. Write academic report
3. Prepare presentation materials
4. Create demo videos

---

## Current Technical Specifications

**Development Environment:**
- OS: Windows with WSL2 (Ubuntu 22.04)
- Docker Engine: Running in WSL2
- Node.js: Version 16+ (for chaincode)
- Hyperledger Fabric: Version 2.2
- Hyperledger Fabric CA: Version 1.5

**Network Endpoints:**
- Traffic Peer0: localhost:7051
- Traffic Peer1: localhost:7061
- CityHall Peer0: localhost:8051
- CityHall Peer1: localhost:8061
- Police Peer0: localhost:9051
- Police Peer1: localhost:9061
- Emergency Peer0: localhost:10051
- Emergency Peer1: localhost:10061
- Orderer0: localhost:7050
- Orderer1: localhost:8050
- Orderer2: localhost:9050

**File Structure:**
```
ATELIER1/
├── chaincode/
│   └── traffic-contract/
│       ├── package.json
│       ├── index.js
│       └── lib/
│           └── trafficContract.js (v1.2)
├── network/
│   ├── configtx.yaml
│   ├── crypto-config.yaml
│   ├── docker-compose-ca.yaml
│   ├── docker-compose-orderer.yaml
│   ├── docker-compose-peers.yaml
│   ├── organizations/ (generated crypto material)
│   └── scripts/
│       ├── start-network.sh
│       ├── generate-crypto.sh
│       ├── create-channel.sh
│       ├── join-channel.sh
│       ├── deploy-chaincode.sh
│       ├── approve-upgrade.sh
│       └── test-chaincode.sh
└── api/ (empty - to be developed)
```

**Blockchain State:**
- Current Block Height: ~30+ blocks (from initialization + tests)
- Deployed Chaincode: traffic-contract v1.2 at sequence 3
- Ledger Data: 4 vehicles, 2 intersections, variable traffic events
- Last Test Run: December 8, 2025 18:05 GMT+1 - All 11 operations passed

---

## Conclusion

We have successfully built and deployed a fully operational multi-organization Hyperledger Fabric blockchain network specifically designed for smart city traffic management. The infrastructure is solid, the chaincode is functional and deterministic, and all basic operations work correctly.

However, the core academic requirement—experimenting with and comparing new consensus mechanisms—remains unimplemented. This is the critical differentiator that transforms this from a standard blockchain deployment into a research project worthy of academic evaluation.

The foundation is strong and ready. The network can handle the additional consensus implementations, and the deterministic chaincode ensures consistent results across different consensus approaches. The next phase requires diving deep into consensus algorithm implementation and rigorous performance analysis.

The dashboard and simulation components, while important for demonstration and usability, are secondary to the consensus experimentation requirement. They enhance the project but don't fulfill the core research objective.

**In summary:** We have a working blockchain. Now we need to make it a research contribution by implementing, testing, and comparing alternative consensus mechanisms against this baseline.
