# Part 05: Evaluation & Grading Guide

Follow this "Testing Protocol" to see the full engineering value of the Smart City Traffic Core.

---

## 🧪 1. Consensus Lab (Core Grade Item)
1.  Open the Dashboard: **http://localhost:3001**
2.  Navigate to **"Consensus Lab"** in the sidebar.
3.  Click **"Run Comparative Benchmark"**.
4.  Watch as the system executes transactions across **RAFT**, **PoA**, and **PBFT**.
5.  **Click "Download Report"**: This generates a scientific PDF analysis of the consensus results directly in your browser.

---

## 🕹️ 2. Network Manager (RBAC & Controls)
1.  Navigate to **"Network Control"**.
2.  **Identity Switching**: Toggle between "Traffic Authority" and "Emergency Services".
    *   *Observation*: Notice how "Deploy Smart Intersection" is ONLY available for the Authority.
3.  **Dynamic Density**: As the Authority, slide the **Traffic Density** to "Chaos (300%)". 
    *   *Observation*: Switch back to the Dashboard map to see the increase in vehicle traffic.
4.  **Interactive Placement**: Click any point on the map. You will see the coordinates appear in the "Expansion Protocol" form. Click "Deploy" to write a new intersection to the blockchain.

---

## 🛡️ 3. Cyber-Resilience (AI Defense)
1.  Open a Windows terminal.
2.  Launch a data falsification attack:
    ```powershell
    node simulator/attack-simulator/lyingSensor.js
    ```
3.  **The Result**:
    *   The Blockchain rejects the transaction (Security Policy).
    *   The **Mini-SOC agents** detect the rejection logs.
    *   A massive **RED ALERT** 🚨 pops up across the entire Dashboard UI!

---

## 🕵️ 4. Blockchain Inspector
Go to "Blockchain Inspector" to see the "Ground Truth". Every action you took above is permanently recorded here as an immutable block. Double-click any block to see the raw transaction data.

---
**Evaluation Summary**:
This project demonstrates a complete E2E integration of Hyperledger Fabric, React modern UI, AI-driven SOC monitoring, and comparative consensus science.
