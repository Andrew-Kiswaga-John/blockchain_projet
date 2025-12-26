# 🚨 Smart City Traffic Core: Attack Simulation Strategy

## 📝 Introduction
A major requirement for our "Traffic Core" project is to prove that the blockchain isn't just a database, but a **security system**. We need to show what happens when someone tries to "cheat" or "hack" the city's traffic network.

Since we are focusing on **Traffic Traffic**, we won't waste time on features like parking. Instead, we will simulate attacks on the things we have already built: **Traffic Lights, Heuristic Sensors, and Emergency Overrides.**

---

## 1. The "Lying Sensor" Attack (Data Falsification)

### 🧐 The Scenario
Imagine a hacker takes control of a roadside sensor (the "Infrastructure Operator"). They want to clear a path for themselves, so they send data to the blockchain saying, *"There are 0 cars at my intersection,"* even though the road is actually packed.

### 🛠️ The Implementation
We will add a "Malicious Mode" toggle in our simulator or dashboard. When turned on, the system will try to send "Impossible Data" to the blockchain (e.g., negative vehicle counts or "LOW" congestion during a peak hour).

### 📖 The Blockchain Lesson
We will update our **Smart Contract (Chaincode)** to include "Sanity Checks." 
*   **Result:** The Blockchain will reject the data before it's even saved. 
*   **Proof:** We can show the professor an "Invalid Transaction" error in the logs, proving the blockchain caught the lie.

---

## 2. The "Imposter" Attack (Privilege Escalation)

### 🧐 The Scenario
Only the **Emergency Services** organization should be allowed to force a traffic light to stay Green for an ambulance. Imagine a regular civilian vehicle (the "Vehicle Operator") tries to use that same "Emergency Green" command to skip traffic.

### 🛠️ The Implementation
We will create a button in the dashboard that tries to trigger an emergency override but uses the "ID Badge" (Security Certificate) of a regular vehicle instead of the Emergency Org.

### 📖 The Blockchain Lesson
This demonstrates **Access Control**. The Blockchain looks at the "ID Badge" attached to the request.
*   **Result:** The transaction will fail with an "Access Denied" error.
*   **Proof:** This proves that the blockchain automatically enforces "Roles" and "Permissions."

---

## 3. The "Race Condition" Attack (MVCC Conflict)

### 🧐 The Scenario
What happens if two different departments try to change the same traffic light at the exact same millisecond? One wants it **Red**, the other wants it **Green**. A normal database might get confused and crash or save both.

### 🛠️ The Implementation
We will build a "Conflict Generator" that sends two conflicting commands to the exact same intersection at the same time.

### 📖 The Blockchain Lesson
This shows off Fabric's **MVCC (Multi-Version Concurrency Control)**. 
*   **Result:** The Blockchain accepts the first one that arrives and automatically kills the second one as "obsolete."
*   **Proof:** One light turns Green, and the dashboard shows a "Conflict Rejected" message for the other, proving the network stays consistent.

---

## 4. The "Traitor in the Room" Attack (Byzantine Fault)

### 🧐 The Scenario
Our PBFT (Consensus) requires multiple organizations to vote on a decision. What if one organization becomes "Byzantine" (a traitor) and tries to stop the vote or send a wrong result to sabotage the city?

### 🛠️ The Implementation
In our **Consensus Lab**, we will simulate a "Malicious Voter." When we run a PBFT test, we will force one of the 4 organizations to "refuse to vote" or send a "corrupted" vote.

### 📖 The Blockchain Lesson
This proves **Consensus Resilience**. 
*   **Result:** Since PBFT only needs a majority (3 out of 4) to agree, the transaction will **still succeed** despite the traitor.
*   **Proof:** We show the professor that the City keeps running perfectly even if one-fourth of the network is compromised.

---

## 🚀 Summary for the Team
By implementing these 4 simulations, we show that our system is:
1.  **Truthful** (Blocks lying sensors).
2.  **Orderly** (Blocks unauthorized users).
3.  **Stable** (Blocks conflicting data).
4.  **Resilient** (Survives malicious sabotage).

This strategy covers the most important technical parts of the course without needing to build extra features that aren't our responsibility!
