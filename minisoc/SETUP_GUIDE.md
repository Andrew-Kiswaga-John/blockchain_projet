# 🍼 Super Simple Guide: Setting up your AI Mini-SOC (Step-by-Step)

Welcome! This guide is for you and your teammates. We will set up your "AI Detective" (Mistral 7B) and your "Secretary" (n8n). 

Follow these steps exactly, and you'll have a running security system in 10 minutes!

---

## 🛠️ Phase 1: Install the "Brain" (LM Studio & Mistral 7B)

LM Studio is the program that lets your computer "talk" to the AI without needing the internet.

1.  **Download it**: Go to [lmstudio.ai](https://lmstudio.ai/) and click the big download button for Windows.
2.  **Install it**: Open the file you just downloaded and follow the instructions until it opens.
3.  **Find the AI**: 
    - Inside LM Studio, click the **Magnifying Glass** (Search) icon on the left.
    - Type `Mistral 7B` in the search bar.
    - Look for "TheBloke/Mistral-7B-Instruct-v0.2-GGUF" (this is the best one for beginners).
    - Click **Download** on one of the versions on the right (choose "Q4_K_M" - it's a good middle ground).
4.  **Start the Server**:
    - Click the **Double Arrow `<->`** icon on the left (it looks like a side-ways Wi-Fi signal). This is the "Local Server" tab.
    - Select your Mistral model at the top.
    - Click the green **Start Server** button.
    - **IMPORTANT**: Leave this window open! Your AI brain needs to stay awake.

---

## 🛠️ Phase 2: Install the "Secretary" (n8n)

n8n is the program that sends the emails and organizes the alerts.

1.  **Install Node.js**: If you don't have it, download and install it from [nodejs.org](https://nodejs.org/).
2.  **Install n8n**: Open your terminal (PowerShell or Command Prompt) and type:
    ```bash
    npm install n8n -g
    ```
3.  **Start n8n**: In the same terminal, type:
    ```bash
    n8n start
    ```
4.  **Open n8n**: Go to `http://localhost:5678` in your web browser.
5.  **Create a Webhook**:
    - Click **Create Workflow**.
    - Add a node called **Webhook**.
    - Set the "Method" to `POST`.
    - Copy the "Test URL" (it looks like `http://localhost:5678/webhook-test/...`).
    - **Go to `responder_agent.py`** and paste this URL into the `N8N_WEBHOOK_URL` part!

---

## 🛠️ Phase 3: Start the Mini-SOC Agents

Now we wake up our 3 Python agents. You need 3 terminal windows open.

### **Window 1: The Ear (Sensor)**
```bash
cd minisoc/agents
python sensor_agent.py
```

### **Window 2: The Brain (Analyzer)**
```bash
python analyzer_agent.py
```

### **Window 3: The Mouth (Responder)**
```bash
python responder_agent.py
```

---

## 🧪 How to Test Everything Together

1.  **Run an Attack**: Open a 4th terminal and run one of your attacks:
    ```bash
    node simulator/attack-simulator/lyingSensor.js
    ```
2.  **Watch the Magic**:
    - **Blockchain** blocks the attack.
    - **Backend** sends the alert to the **Sensor Agent**.
    - **Sensor Agent** passes it to the **Analyzer**.
    - **Analyzer** asks Mistral 7B: "What happened?"
    - **Mistral** writes a report.
    - **Responder Agent** sends that report to **n8n**.
    - **n8n** shows a success message!

---

### 🚨 Troubleshooting for 5-Year-Olds:
- **"It says 'module not found'"**: Run `pip install flask requests` in your terminal.
- **"The AI isn't responding"**: Go back to LM Studio and make sure the "Start Server" button is green.
- **"n8n says 404"**: Make sure you clicked the "Execute Workflow" button in n8n before running the attack.
