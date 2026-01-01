from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Config: Where is your n8n Webhook?
# REPLACE THIS URL with your actual n8n webhook URL from the n8n dashboard
N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/security-alert')

@app.route('/respond', methods=['POST'])
def send_response():
    """
    This is the MOUTH of the Mini-SOC.
    It takes the AI's report and sends it to n8n to alert the humans.
    """
    final_report = request.json
    print(f"\n[RESPONDER] 📢 Sending final report to n8n for orchestration...")

    # Data to send to n8n
    payload = {
        "event_type": "SECURITY_ALERT",
        "subject": f"[{final_report.get('severity')}] Smart City Blockchain Alert: {final_report.get('attack_type')}",
        "analysis": final_report.get('ai_analysis'),
        "blockchain_proof": {
            "tx_id": final_report.get('alert_id'),
            "attacker": final_report.get('attacker_msp')
        },
        "raw_incident": final_report
    }

    try:
        # Shout to n8n
        response = requests.post(N8N_WEBHOOK_URL, json=payload)
        print(f"[RESPONDER] ✅ n8n notified! Status: {response.status_code}")
        return jsonify({"status": "delivered", "n8n_status": response.status_code}), 200
    except Exception as e:
        print(f"[RESPONDER] ❌ Error talking to n8n: {str(e)}")
        return jsonify({"status": "error", "message": "Make sure n8n is running and webhook is active!"}), 500

if __name__ == '__main__':
    print("🛡️ Mini-SOC: RESPONDER AGENT is awake and reporting on port 5002...")
    app.run(host='0.0.0.0', port=5002)
