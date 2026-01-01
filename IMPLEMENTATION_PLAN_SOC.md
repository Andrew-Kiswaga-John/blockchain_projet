# 🛠️ Implementation Plan: Secure City Mini-SOC Integration

This plan details how we will connect your **Hyperledger Fabric Blockchain** to your **Mini-SOC (AI + n8n)** using a dedicated simulation script.

---

## 📅 Architecture Overview
1.  **Attack Simulator**: A script that sends "malicious" requests to the system.
2.  **Blockchain**: Blocks the attack and emits a `SecurityAlert` event.
3.  **Backend (The Bridge)**: Captures the event and forwards it to the AI Agents.
4.  **AI (Mistral 7B)**: Analyzes the context and decides if it's a real threat.
5.  **n8n (The Messenger)**: Sends the final email notification to the team.

---

## 📂 Phase 1: The Attack Simulator
Instead of a dashboard, we create a specialized tool for attacks.

### [NEW] `simulator/attack-simulator/`
*   Create a dedicated folder for malicious simulations.
*   `lyingSensor.js`: A script that sends impossible vehicle data (e.g., -5 cars) to the Traffic Contract.
*   `imposterHack.js`: A script that tries to force a light to GREEN using a regular user identity instead of an Emergency identity.

---

## 📂 Phase 2: The "Security Bridge" (Backend)
We need the backend to listen for attacks.

### [NEW] `application/backend/src/services/socService.js`
*   **Purpose**: The "Bridge" between the Blockchain and your Mini-SOC.
*   **Logic**: 
    - It listens for transaction failures or specific "SecurityEvents" from the chaincode.
    - It captures the details (MSPID, IP, Type of failure, Timestamp).
    - It sends these details to your Python Agent via a simple HTTP request or socket.

---

## 📂 Phase 3: The AI Detective (Mini-SOC Agents) [DONE!]
Your agents are now ready in `minisoc/agents/`.

*   **sensor_agent.py**: The "Ear" that catches blockchain events.
*   **analyzer_agent.py**: The "Brain" that connects to Mistral 7B.
*   **responder_agent.py**: The "Mouth" that shouts to n8n.

**Follow the [SETUP_GUIDE.md](file:///c:/Users/Asus/Documents/S3/BLOCKCHAIN/ATELIER1/minisoc/SETUP_GUIDE.md) for step-by-step instructions.**

---

## 📂 Phase 4: The Orchestration (n8n)
*   **Workflow**: 
    - **Webhook**: Triggered by the Responder Agent.
    - **Email Node**: Sends an alert formatted specifically for the Smart City.
    - **Example Subject**: `[URGENT] Blockchain Security Alert: Light Manipulation Attempt Detected`

---

## 📝 Layman's Summary Checklist:
1.  [x] **Update Chaincode** (Done!).
2.  [ ] **Create Attack Scripts**: Write `lyingSensor.js` and `imposterHack.js` in the simulator folder.
3.  [ ] **Create Backend Bridge**: Write the `socService.js` to catch errors.
4.  [ ] **Test the AI Loop**: Run an attack and watch the agents analyze it.

**Placement**: This file is now located in the project root for everyone to see!
