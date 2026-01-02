# Part 03: Setting Up the Backend SDK Bridge

This guide explains how to launch the Node.js API that bridges the Dashboard to the Hyperledger Fabric ledger.

---

## ⚙️ Step 1: Backend Installation
Open a **NEW tab** in your **WSL Ubuntu Terminal**.

```bash
cd ~/traffic-core/application/backend

# Install the Fabric Node.js SDK
npm install
```

---

## 🌐 Step 2: Environment Configuration
The backend needs to know where the network configuration is located in WSL.

Run this in the same terminal:
```bash
export NETWORK_PATH=~/traffic-core/network
```

---

## 🚀 Step 3: Start the Backend
Launch the server:

```bash
npm start
```

**What to look for:**
*   You should see: `🚀 Starting Traffic Core Backend...`
*   Followed by: `✓ Fabric Client connected successfully.`
*   If you see connection errors, ensure **Phase 02 (deployCC)** finished successfully.

---

## ✅ Next Step
Proceed to **[Part 04: Launching Windows Applications](04-windows-apps.md)**.
