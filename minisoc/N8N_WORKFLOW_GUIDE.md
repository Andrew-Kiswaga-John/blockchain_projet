# 📧 How to Send the AI Report to Gmail using n8n (Super Simple Guide)

Your Mini-SOC is working properly! The AI analyzed the attack and sent the report to n8n.
Now, we just need to tell n8n **what to do** with that report.

We will create a simple line: `Webhook -> Gmail`

---

## 🛠️ Step 1: Add the Gmail Node

1.  Go to your n8n browser tab (`http://localhost:5678`).
2.  Open your **Smart City** workflow (where your Webhook node is).
3.  Click the **(+)** button (or "Add Node").
4.  Search for **Gmail**.
5.  Click on **Gmail** in the list.
6.  A window will pop up. Choose **"Send"** (or "Send Email") as the action.

---

## 🔑 Step 2: Connect Your Google Account

1.  In the Gmail node window, find "Credential to connect with".
2.  Click **"Select Credential"** -> **"Create New"**.
3.  Select **"Sign in with Google"**.
4.  A popup will appear. Login with `abc@gmail.com`.
5.  Click **"Allow"** to give n8n permission to send emails.
6.  Once connected, close the credential window.

---

## 📝 Step 3: Configure the Email

Now we fill in the blanks. We want to use the data from the AI!

1.  **To:** Type `abc@gmail.com`
2.  **Subject:** 
    *   Click the little **Expression (gear/fns)** icon next to the field.
    *   Type this: `🚨 ALERT: {{ $json.body.subject }}`
    *   *Explanation: This grabs the "subject" line that our Python Responder Agent sent!*
3.  **Body (Text or HTML):**
    *   Click the **Expression** icon again.
    *   Copy and paste this exactly:
    ```text
    Hello City Manager,

    The AI Guardian has detected a new security incident.

    🛑 ALERT TYPE: {{ $json.body.raw_incident.attack_type }}
    🔥 SEVERITY: {{ $json.body.raw_incident.severity }}
    🕵️ ATTACKER: {{ $json.body.raw_incident.attacker_msp }}

    🤖 AI ANALYSIS:
    {{ $json.body.analysis }}

    ------------------------------------------------
    Blockchain Transaction ID: {{ $json.body.blockchain_proof.tx_id }}
    ```

---

## 🔗 Step 4: Connect the Dots

1.  Close the Gmail node settings.
2.  You will see two boxes on your screen: **Webhook** and **Gmail**.
3.  Click the little **circle** on the right side of the **Webhook** node.
4.  Drag a line to the little **circle** on the left side of the **Gmail** node.
5.  **This is important!** The line connects them so the data flows from Webhook -> Gmail.

---

## ✅ Step 5: Save and Activate

1.  Click **Save** (top right floppy disk icon).
2.  Make sure the **Active** toggle (top right) is **GREEN**.
3.  **Run the attack again** (`node lyingSensor.js`).
4.  Check your phone/email! You should receive the AI report instantly! 🚀
