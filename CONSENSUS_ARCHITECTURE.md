# Consensus Experimentation: Architectural Blueprint & Implementation Guide

## 1. Overview
This document details the technical architecture for implementing the **Consensus Experimentation** module of the Traffic Core project. It explains how the new components fit into our existing Hyperledger Fabric structure and defines the specific metrics we will use to evaluate performance.

---

## 2. Architectural Integration Plan

We are building a **"Consensus Simulation Layer"** on top of our existing infrastructure. This allows us to compare Raft, PoA, and PBFT without modifying the core Fabric binaries.

### A. The Chaincode Layer (WSL)
**Location:** `chaincode/consensus-contract/`
We will create a dedicated smart contract for these experiments to keep our production code clean.

*   **File**: `lib/consensus-contract.js`
*   **Responsibility**: Enforce the rules of each consensus model.
    *   **Raft Mode**: Accepts any valid transaction (Standard Fabric behavior).
    *   **PoA Mode**: Checks `ctx.clientIdentity.getMSPID()` and rejects anyone who is not `TrafficAuthorityMSP`.
    *   **PBFT Mode**: Implements a multi-stage voting process. Stores a "Proposal" state and waits for $2/3$ of organizations to submit "Vote" transactions before marking the state as `FINALIZED`.

### B. The Backend Layer (WSL)
**Location:** `application/backend/src/`

*   **`controllers/consensusController.js`**: The orchestration logic.
    *   Methods: `runRaftTest()`, `runPoATest()`, `runPBFTTest()`.
*   **`fabric-sdk/fabricClient.js`**: **Critical Update Required**.
    *   Currently, the SDK connects as a single user.
    *   For PBFT, the backend must simulate a decentralized network by submitting transactions on behalf of multiple organizations (Traffic, Emergency, Infrastructure) sequentially to simulate the voting process.

### C. The Frontend Layer (Windows)
**Location:** `application/frontend/src/`

*   **`components/ConsensusLab.jsx`**: A new dashboard view.
*   **Role**: The "Stopwatch" and Visualizer.
    *   Triggers the tests via API.
    *   Listens for WebSocket events (`ConsensusFinalized`).
    *   Calculates and displays the performance metrics in real-time charts.

### D. The Simulator (Windows/WSL)
**Location:** `simulator/`

*   **`load-tester.js`**: A stress-testing script.
*   **Role**: Unlike the frontend (single-run), this script fires 50-100 parallel requests to measure system throughput (TPS) under heavy load for each consensus type.

---

## 3. Execution Flow: The PBFT Example

To understand how the pieces fit together, here is the lifecycle of a **PBFT (Voting)** experiment:

1.  **Frontend**: User clicks "Test PBFT". Frontend records `StartTime`.
2.  **Backend**: Receives request.
    *   *Step 1*: Submits a "Proposal" transaction to `consensus-contract` (State: `PENDING`).
    *   *Step 2*: Backend iterates through 3 other organization wallets (Emergency, Infra, Parking).
    *   *Step 3*: For each wallet, it submits a "Vote" transaction to `consensus-contract`.
3.  **Chaincode**:
    *   Receives Vote 1 $\rightarrow$ Count = 1.
    *   Receives Vote 2 $\rightarrow$ Count = 2.
    *   Receives Vote 3 $\rightarrow$ Count = 3 (Threshold reached!).
    *   **Event Emitted**: `ConsensusFinalized`.
4.  **Backend**: Listens for `ConsensusFinalized` event. Sends socket message to Frontend.
5.  **Frontend**: Receives message. Records `EndTime`. Calculates `Duration`.

---

## 4. Performance Metrics (Evaluation Criteria)

We will use these specific metrics to evaluate and compare the consensus models.

### Metric 1: Transaction Finality Latency ($T_{finality}$)
*   **Definition**: The exact time elapsed between the client submitting the request and the immutable confirmation appearing on the ledger.
*   **Why it matters**: In a Smart City, latency determines how quickly the system reacts to emergencies.
*   **Expected Result**:
    *   **Raft**: ~2.1s (Baseline).
    *   **PoA**: ~2.2s (Slight overhead for identity check).
    *   **PBFT**: ~6-8s (High latency due to multiple voting transactions).

### Metric 2: Network Message Complexity ($M_{c}$)
*   **Definition**: The number of distinct blockchain transactions required to achieve **one** logical state change.
*   **Why it matters**: Measures "Network Bloat". High complexity leads to congestion.
*   **Formula**:
    *   **Raft/PoA**: $M_c = 1$
    *   **PBFT**: $M_c = 1 + N$ (where $N$ is the number of voters).

### Metric 3: Throughput Efficiency (TPS under Load)
*   **Definition**: Transactions Per Second the network can handle before lagging.
*   **Why it matters**: Determines scalability during rush hour.
*   **Hypothesis**: PBFT will significantly reduce effective throughput because every logical request generates $N$ extra "noise" transactions, filling up blocks rapidly.

### Metric 4: Fault Tolerance Threshold (Liveness Test)
*   **Definition**: The ability of the system to finalize decisions when nodes are offline.
*   **The Test**: Run PBFT with 4 organizations but simulate 2 being offline (do not send votes).
*   **Result**: The transaction should remain `PENDING` forever, proving the consensus rules are enforcing safety over liveness.

---

## 5. Implementation Checklist

1.  [ ] **Chaincode**: Create `chaincode/consensus-contract` with Raft, PoA, and PBFT logic.
2.  **Deployment**: Update `deployChaincode.sh` to include the new contract.
3.  **Backend**: Implement `ConsensusController` and update `FabricClient` for multi-org identity simulation.
4.  **Frontend**: Build the `ConsensusLab` dashboard with charts.
5.  **Testing**: Run `load-tester.js` to generate the final report data.
