# 🛡️ Integrated Attack Simulation & Cognitive SOC Strategy

## 📖 Introduction
This document explains how our **Blockchain Network** works together with our **Mini-SOC (Security Operations Center)** to protect the Smart City. 

We aren't just building a database; we are building an **Intelligent Guardian**.
*   **The Blockchain** is the "Enforcer": It follows strict rules and blocks any "bad" transactions.
*   **The Mini-SOC** is the "Detective": It uses AI (Mistral 7B) to analyze *why* someone attacked us and uses n8n to alert the humans.

---

## 🏗️ The 4-Layer Architecture (Layman's Terms)

### 1. The Threat Layer (The Attack Simulator)
Instead of a simple dashboard, we have a dedicated **Attack Simulator** folder. This is a special script that "acts" like a hacker.
*   **Location**: `simulator/attack-simulator`
*   **Job**: It deliberately sends "bad" data or "stolen" identity credentials to the blockchain to see if the system catches it.

### 2. The Blockchain Layer (The Wall)
Our Smart Contracts (`traffic` and `emergency`) check the data. 
*   If the data is "impossible" (e.g., -50 cars), the Blockchain **rejects** it.
*   If the user is unauthorized (e.g., a civilian changing lights), the Blockchain **blocks** it.
*   **NEW**: The Blockchain now "shouts" (emits an Event) when it catches an attacker.

### 3. The AI Agent Layer (The Brain - Mini-SOC)
Your AI agents listen to the Blockchain's "shouts":
*   **Sensor Agent**: Captures the rejection message from the Blockchain.
*   **Analyzer Agent (Mistral 7B)**: Receives the data. It asks: *"Is this just a typo, or is someone trying to hack the city?"* 
*   **Responder Agent**: Formats the AI's opinion into a report.

### 4. The Orchestration Layer (The Action - n8n)
The Responder sends the report to **n8n**. n8n then:
*   Sends an **Email Alert** to the city manager.
*   Creates a **Security Ticket** with the AI's analysis.

---

## 🚀 Step-by-Step Implementation for Teammates

To implement this on your end, follow these 4 steps:

### Step 1: Secure the Chaincode (The Wall)
We have added "Gatekeeper" code.
*   **Check logic**: `if (vehicleCount < 0) throw new Error(...)`
*   **Check ID**: `if (mspId !== 'EmergencyServices') throw new Error(...)`

### Step 2: Set up the Attack Simulator
In the `simulator/attack-simulator` folder, we create scripts that:
*   Try to send negative vehicle counts.
*   Try to trigger emergency overrides using a non-emergency identity.

### Step 3: Set up the Blockchain Listener (The Sensor Agent)
In our backend (`application/backend`), we add a script that stays awake and listens for any `SecurityAlert` events. It then forwards these to the **Mini-SOC Sensor Agent**.

### Step 4: Connect the AI and n8n
When an alert is captured, we send the details to **Mistral 7B** and then to your **n8n Webhook**.

---

## 🧪 Simulation Scenarios (What we will show the Professor)

### Scenario A: The "Crazy Sensor"
1.  **Attack**: run `node simulator/attack-simulator/lyingSensor.js`.
2.  **Blockchain**: Rejects the data because it's "physically impossible."
3.  **AI (Mini-SOC)**: Analyzes and says: *"This looks like a hardware malfunction."*
4.  **n8n**: Sends an email to the **Maintenance Team**.

### Scenario B: The "Imposter Authority"
1.  **Attack**: run `node simulator/attack-simulator/imposterHack.js`.
2.  **Blockchain**: Blocks the user (Wrong MSP ID).
3.  **AI (Mini-SOC)**: Warns: *"High Alert! Privilege Escalation attempt."*
4.  **n8n**: Sends an email to the **Police/Security Team**.
