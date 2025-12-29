const fabricClient = require('../fabric-sdk/fabricClient');
const socService = require('../services/socService');

class EmergencyController {

    // Get emergency statistics
    async getStatistics(req, res) {
        try {
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');
            const result = await contract.evaluateTransaction('getEmergencyStatistics');

            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting emergency stats:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Create emergency
    async createEmergency(req, res) {
        try {
            const { emergencyId, type, severity, latitude, longitude, address, description } = req.body;
            const orgName = req.header('x-org-name') || 'EmergencyServices';
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract', orgName);

            await contract.submitTransaction(
                'createEmergency',
                emergencyId,
                type,
                severity,
                latitude.toString(),
                longitude.toString(),
                address || 'Unknown',
                description || ''
            );

            res.json({
                success: true,
                message: `Emergency ${emergencyId} created successfully`,
                emergencyId
            });
        } catch (error) {
            console.error('Error creating emergency:', error);

            // Phase 2: Report to SOC
            socService.handleBlockchainError(error, {
                action: 'createEmergency',
                orgName: req.header('x-org-name') || 'EmergencyServices',
                data: req.body
            });

            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Get all active emergencies
    async getActiveEmergencies(req, res) {
        try {
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');
            const result = await contract.evaluateTransaction('queryActiveEmergencies');

            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting active emergencies:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Query emergency by ID
    async getEmergency(req, res) {
        try {
            const { emergencyId } = req.params;
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');
            const result = await contract.evaluateTransaction('queryEmergency', emergencyId);

            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting emergency:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Update emergency status
    async updateStatus(req, res) {
        try {
            const { emergencyId, status, vehicleId } = req.body;
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');

            await contract.submitTransaction(
                'updateEmergencyStatus',
                emergencyId,
                status,
                vehicleId || ''
            );

            res.json({
                success: true,
                message: `Emergency ${emergencyId} updated to ${status}`
            });
        } catch (error) {
            console.error('Error updating emergency status:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Assign vehicle to emergency
    async assignVehicle(req, res) {
        try {
            const { emergencyId, vehicleId, estimatedArrival } = req.body;
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');

            await contract.submitTransaction(
                'assignVehicle',
                emergencyId,
                vehicleId,
                estimatedArrival || ''
            );

            res.json({
                success: true,
                message: `Vehicle ${vehicleId} assigned to emergency ${emergencyId}`
            });
        } catch (error) {
            console.error('Error assigning vehicle:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new EmergencyController();
