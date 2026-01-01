from flask import Flask, request, jsonify
import requests
import json
import os

app = Flask(__name__)

# Config: Where is the next agent (Analyzer)?
ANALYZER_URL = os.getenv('ANALYZER_URL', 'http://localhost:5001/analyze')

@app.route('/report', methods=['POST'])
def receive_incident():
    """
    This is the EAR of the Mini-SOC. 
    It catches the 'Shout' from the Blockchain Backend.
    """
    data = request.json
    print(f"\n[SENSOR] 👂 Received incident from Blockchain: {data.get('type')}")
    
    # Pre-processing: Just making sure the data is clean
    incident_packet = {
        "alert_id": data.get('details', {}).get('txId', 'UNKNOWN'),
        "timestamp": data.get('timestamp'),
        "severity": data.get('severity'),
        "attack_type": data.get('type'),
        "attacker_msp": data.get('details', {}).get('attacker'),
        "raw_details": data.get('details', {}).get('message'),
        "captured_data": data.get('details', {}).get('data')
    }

    print(f"[SENSOR] 📨 Forwarding to Analyzer Agent (The Brain)...")
    
    try:
        # Pass the ball to the Analyzer
        response = requests.post(ANALYZER_URL, json=incident_packet)
        return jsonify({"status": "captured", "analyzer_response": response.json()}), 200
    except Exception as e:
        print(f"[SENSOR] ❌ Error talking to Analyzer: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("🛡️ Mini-SOC: SENSOR AGENT is awake and listening on port 5000...")
    app.run(host='0.0.0.0', port=5000)
