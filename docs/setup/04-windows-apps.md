# Part 04: Launching Windows Applications

This guide covers starting the Dashboard, the Simulator, and the AI Security Agents on Windows.

---

## 📊 Step 1: Start the Dashboard UI
Open a **Windows Terminal** (PowerShell or CMD) at the project root.

```powershell
cd application/frontend

# Install React dependencies
npm install

# Start the Cyberpunk Dashboard
npm start
```
*The UI will be available at: **http://localhost:3001***

---

## 🚗 Step 2: Start the Traffic Simulator
Open **ANOTHER Windows Terminal**. This generates the live data stream for the city.

```powershell
cd simulator/vehicle-simulator

# Install simulation dependencies
npm install

# Start the simulation engine
npm start
```

---

## 🛡️ Step 3: Start Mini-SOC AI Agents
This project uses AI agents to monitor the blockchain. Open **3 separate Windows terminals**:

**Terminal A (The Sensor):**
```powershell
cd minisoc\agents
python sensor_agent.py
```

**Terminal B (The Analyzer):**
```powershell
cd minisoc\agents
python analyzer_agent.py
```

**Terminal C (The Responder):**
```powershell
cd minisoc\agents
python responder_agent.py
```

---

## ✅ Next Step
Proceed to the **[Evaluation & Grading Guide](05-evaluation-guide.md)**.
