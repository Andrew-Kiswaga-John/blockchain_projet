const fabricClient = require('../fabric-sdk/fabricClient');

class EmergencyController {

    async getStatistics(req, res) {
        try {
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');
            const result = await contract.evaluateTransaction('getEmergencyStatistics');
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting emergency stats:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async createEmergency(req, res) {
        try {
            const { emergencyId, type, severity, latitude, longitude, address, description } = req.body;
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');
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
                message: 'Emergency created successfully',
                emergencyId
            });
        } catch (error) {
            console.error('Error creating emergency:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getActiveEmergencies(req, res) {
        try {
            const contract = await fabricClient.getContract('emergency-ops', 'emergency-contract');
            const result = await contract.evaluateTransaction('queryActiveEmergencies');
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting active emergencies:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }

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
            console.error('Error getting emergency:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }

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
                message: 'Emergency status updated'
            });
        } catch (error) {
            console.error('Error updating emergency status:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }

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
                message: 'Vehicle assigned successfully'
            });
        } catch (error) {
            console.error('Error assigning vehicle:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new EmergencyController();
