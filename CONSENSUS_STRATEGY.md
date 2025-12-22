# Consensus Experimentation Strategy: Application-Level Simulation

## Overview
This document outlines our strategy for satisfying the **Consensus Experimentation** requirement of the "Traffic Core" sub-project.

**The Challenge:**
The project requirements state we must:
> "Experiment 2 new mechanisms of consensus (ex. PBFT modified, PoA...)"
> "Compare the performance of these consensus with well-determined metrics."

However, our underlying infrastructure (Hyperledger Fabric v2.x) uses **Raft (etcdraft)** for transaction ordering. Replacing the ordering service binaries is complex and outside the scope of a standard simulation project.

**The Solution:**
We will implement **Application-Level Consensus**. Instead of changing *how blocks are ordered*, we will change *how decisions are finalized* within our Smart Contracts. This allows us to simulate the behavior, latency, and trade-offs of different consensus models (PoA, PBFT) on top of the stable Raft network.

---

## 1. The Three Consensus Models

We will implement three distinct "modes" of operation in a dedicated `ConsensusContract` to compare their performance.

### A. Baseline: RAFT (Standard Fabric)
*   **Mechanism**: The standard Hyperledger Fabric flow.
    1.  Client submits transaction.
    2.  Peers endorse it.
    3.  Orderer (Raft) orders it into a block.
    4.  Peers commit the block.
*   **Latency**: ~2 seconds (Block time).
*   **Throughput**: High.
*   **Trust Model**: Crash Fault Tolerance (CFT). We trust the Orderer nodes.

### B. Experiment 1: Proof of Authority (PoA) Simulation
*   **Concept**: A single trusted entity (The "Authority") has the absolute power to validate a state change.
*   **Implementation Logic**:
    *   A function `submitPoATransaction(data)` is created.
    *   Inside the chaincode, we check the identity of the caller:
        ```javascript
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId !== 'TrafficAuthorityMSP') {
            throw new Error('Consensus Error: Only Traffic Authority can validate this transaction.');
        }
        ```
*   **Trade-off**:
    *   **Pros**: Extremely fast validation logic.
    *   **Cons**: Centralized. If the Authority is compromised, the network is compromised.

### C. Experiment 2: Modified PBFT (Voting/Multi-Sig) Simulation
*   **Concept**: A decision is only finalized when a supermajority ($2/3$) of the network participants agree (vote) on it. This simulates Byzantine Fault Tolerance.
*   **Implementation Logic**:
    1.  **Phase 1 (Pre-Prepare)**: Any organization calls `proposeChange(proposalId, data)`. The state is saved as `PENDING`.
    2.  **Phase 2 (Prepare/Commit)**: Other organizations (Emergency, Infrastructure, etc.) review the proposal and call `voteForProposal(proposalId)`.
    3.  **Phase 3 (Finalize)**: The smart contract counts the votes.
        ```javascript
        if (voteCount >= (TotalOrgs * 2/3)) {
            proposal.status = 'FINALIZED';
            // Execute the actual logic (e.g., update traffic light)
        }
        ```
*   **Trade-off**:
    *   **Pros**: Decentralized, secure against malicious actors.
    *   **Cons**: High Latency. Requires $N$ transactions (1 proposal + $N$ votes) to finalize one state change.

---

## 2. Implementation Plan

### Step 1: `ConsensusContract`
We will create a new chaincode file `consensus-contract.js` containing:
*   `submitRaft(ctx, id, value)`: Standard storage.
*   `submitPoA(ctx, id, value)`: Storage with MSPID check.
*   `submitPBFTProposal(ctx, id, value)`: Initialize voting.
*   `votePBFT(ctx, id)`: Record vote and check threshold.

### Step 2: Dashboard Integration
We will add a **"Consensus Lab"** page to the Frontend Dashboard.
*   **Buttons**: "Run Raft Test", "Run PoA Test", "Run PBFT Test".
*   **Visualization**: A real-time graph showing the time taken from "Start" to "Finalized".

### Step 3: Performance Metrics (The "Comparison")
The dashboard will automatically calculate and display:
1.  **Latency (ms)**: Time from button click to data appearing on the ledger.
    *   *Hypothesis*: Raft < PoA (slightly) << PBFT (significantly).
2.  **Transaction Count**: Number of blockchain transactions required for 1 logical operation.
    *   Raft: 1
    *   PoA: 1
    *   PBFT: $N$ (where $N$ is number of voters).

---

## 3. Why this satisfies the Project Requirements
*   **"Experiment 2 new mechanisms"**: We are explicitly coding the logic of PoA and PBFT.
*   **"Compare performance"**: We are measuring the latency and overhead of these mechanisms.
*   **"Visualizer les transactions"**: The dashboard will show the voting process in real-time (e.g., "Waiting for votes: 1/3... 2/3... Finalized").

This approach allows us to demonstrate a deep understanding of consensus mechanics without the risk of breaking the underlying Fabric network configuration.
