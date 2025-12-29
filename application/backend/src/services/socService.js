const axios = require('axios');

class SOCService {
    constructor() {
        this.agentUrl = process.env.SOC_AGENT_URL || 'http://localhost:5000/report';
        this.enabled = true;
    }

    /**
     * Report a security-related incident to the Mini-SOC
     * @param {Object} incident - Incident details
     */
    async reportIncident(incident) {
        if (!this.enabled) return;

        const payload = {
            timestamp: new Date().toISOString(),
            source: 'Blockchain-Backend',
            type: incident.type || 'UNKNOWN_SECURITY_EVENT',
            severity: incident.severity || 'MEDIUM',
            details: {
                message: incident.message,
                attacker: incident.attacker || 'Unknown',
                action: incident.action || 'Unauthorized Action',
                data: incident.data || {},
                txId: incident.txId || 'N/A'
            }
        };

        console.log(`[SOC-BRIDGE] 🔔 Alerting Mini-SOC: ${payload.type}`);

        try {
            // Forwarding to the AI Agent (Python Sensor)
            // Note: If the agent isn't running, we log it but don't crash
            await axios.post(this.agentUrl, payload).catch(err => {
                console.warn(`[SOC-BRIDGE] ⚠️ Mini-SOC Agent unreachable at ${this.agentUrl}. (Is the Python agent running?)`);
            });
        } catch (error) {
            // Silent fail to avoid blocking the main backend logic
        }
    }

    /**
     * Helper to classify errors from the blockchain
     * @param {Error} error - The caught error object
     * @param {Object} context - Context of the failed transaction
     */
    handleBlockchainError(error, context) {
        const msg = error.message.toLowerCase();
        let incidentType = 'GENERAL_BLOCKCHAIN_ERROR';
        let severity = 'LOW';

        if (msg.includes('validation failed') || msg.includes('physically impossible')) {
            incidentType = 'DATA_FALSIFICATION_ATTEMPT';
            severity = 'MEDIUM';
        } else if (msg.includes('access denied') || msg.includes('not authorized') || msg.includes('msp') || msg.includes('unauthorized')) {
            incidentType = 'UNAUTHORIZED_ACCESS_ATTEMPT';
            severity = 'HIGH';
        } else if (msg.includes('mvcc') || msg.includes('conflict')) {
            incidentType = 'CONCURRENCY_CONFLICT';
            severity = 'LOW';
        } else if (msg.includes('byzantine') || msg.includes('sabotage')) {
            incidentType = 'BYZANTINE_FAULT_DETECTED';
            severity = 'CRITICAL';
        }

        this.reportIncident({
            type: incidentType,
            severity: severity,
            message: error.message,
            attacker: context.orgName || 'Unknown',
            action: context.action || 'Unknown Transaction',
            data: context.data || {},
            txId: context.txId || 'N/A'
        });
    }
}

module.exports = new SOCService();
