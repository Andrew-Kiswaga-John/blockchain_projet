# Part 02: Launching the Blockchain Network

This guide walks you through starting the multi-organization Fabric network and deploying the smart contracts.

---

## 📦 Step 1: Install Chaincode Dependencies
The smart contracts are written in Node.js and require internal dependencies to be installed **inside WSL**.

Run these in your **WSL Terminal**:

```bash
# 1. Main Traffic Contract
cd ~/traffic-core/chaincode/traffic-contract
npm install

# 2. Emergency Operations Contract
cd ~/traffic-core/chaincode/emergency-contract
npm install

# 3. Consensus Laboratory Contract
cd ~/traffic-core/chaincode/consensus-contract
npm install
```

---

## 🚀 Step 2: Start the Network
Now we bring the 10-peer network (5 Organizations + Orderer) online.

```bash
cd ~/traffic-core/network

# 1. Start Docker Containers
./scripts/network.sh up

# 2. Create high-speed communication channels (city-traffic-global & emergency-ops)
./scripts/network.sh createChannel
```

---

## 📜 Step 3: Deploy Smart Contracts
This step commits the business logic to the ledger. This process takes approximately 2-5 minutes as it compiles and initializes the chaincode on all peers.

```bash
./scripts/network.sh deployCC
```

*Verification: Look for "Chaincode definition committed" in the output logs.*

---

## ✅ Next Step
Proceed to **[Part 03: Setting Up the Backend SDK Bridge](03-backend-sdk.md)**.
