from flask import Flask, request, jsonify
import requests
import json
import os

app = Flask(__name__)

# Config: Where is LM Studio and the next agent (Responder)?
LM_STUDIO_URL = os.getenv('LM_STUDIO_URL', 'http://localhost:1234/v1/chat/completions')
RESPONDER_URL = os.getenv('RESPONDER_URL', 'http://localhost:5002/respond')

SYSTEM_PROMPT = """
You are the "Smart City Cyber-Guardian". Your job is to analyze security alerts from a Hyperledger Fabric Blockchain.
You are an expert in Blockchain, Smart Contracts, and Cyber-Security.

When you receive an alert, explain:
1. WHAT happened in simple words.
2. WHY it is dangerous for the city.
3. WHO is likely responsible (based on the MSP identity).
4. WHAT should be done next (Maintenance, Police, or Admin action).

Be professional but clear. Avoid overly technical jargon when possible.
"""

@app.route('/analyze', methods=['POST'])
def analyze_incident():
    """
    This is the BRAIN of the Mini-SOC.
    It takes the raw data and asks Mistral 7B (ML Studio) for its opinion.
    """
    incident = request.json
    print(f"\n[ANALYZER] 🧠 Analyzing attack: {incident.get('attack_type')}")

    # Prepare the question for Mistral
    prompt = f"""
    SECURITY ALERT DETAILS:
    - Type: {incident.get('attack_type')}
    - Severity: {incident.get('severity')}
    - Attacker (MSP): {incident.get('attacker_msp')}
    - Blockchain Message: {incident.get('raw_details')}
    - Attempted Data: {json.dumps(incident.get('captured_data'))}
    
    Guardian, please analyze this and provide a summary for the City Manager.
    """

    print(f"[ANALYZER] 🤖 Consulting Mistral 7B via LM Studio...")

    try:
        # Talk to LM Studio (Merged System Prompt for compatibility)
        full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt}"
        
        response = requests.post(LM_STUDIO_URL, json={
            "model": "mistral-7b",
            "messages": [
                {"role": "user", "content": full_prompt}
            ],
            "temperature": 0.7
        })
        
        ai_opinion = response.json()['choices'][0]['message']['content']
        print(f"[ANALYZER] ✅ AI Analysis Complete.")

        # Add the AI's opinion to the packet
        incident['ai_analysis'] = ai_opinion

        # Pass the ball to the Responder
        requests.post(RESPONDER_URL, json=incident)
        
        return jsonify({"status": "analyzed", "opinion": ai_opinion}), 200
    except Exception as e:
        print(f"[ANALYZER] ❌ Error consulting AI: {str(e)}")
        return jsonify({"status": "error", "message": "Make sure LM Studio is running!"}), 500

if __name__ == '__main__':
    print("🛡️ Mini-SOC: ANALYZER AGENT is awake and thinking on port 5001...")
    app.run(host='0.0.0.0', port=5001)
