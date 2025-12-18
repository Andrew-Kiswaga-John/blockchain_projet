const fabricClient = require('../fabric-sdk/fabricClient');

class TrafficController {
    
    // Get all vehicles
    async getAllVehicles(req, res) {
        try {
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            const result = await contract.evaluateTransaction('queryAllVehicles');
            
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting vehicles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Register new vehicle
    async registerVehicle(req, res) {
        try {
            const { vehicleId, type, owner } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            await contract.submitTransaction('registerVehicle', vehicleId, type, owner);
            
            res.json({
                success: true,
                message: `Vehicle ${vehicleId} registered successfully`
            });
        } catch (error) {
            console.error('Error registering vehicle:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Update vehicle position
    async updateVehiclePosition(req, res) {
        try {
            const { vehicleId, latitude, longitude, speed, heading } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            const timestamp = new Date().toISOString();
            await contract.submitTransaction(
                'updateVehiclePosition',
                vehicleId,
                latitude.toString(),
                longitude.toString(),
                speed ? speed.toString() : '0',
                heading ? heading.toString() : '0',
                timestamp
            );
            
            res.json({
                success: true,
                message: `Position updated for vehicle ${vehicleId}`
            });
        } catch (error) {
            console.error('Error updating position:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Query vehicles by area
    async queryVehiclesByArea(req, res) {
        try {
            const { latitude, longitude, radius } = req.query;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            const result = await contract.evaluateTransaction(
                'queryVehiclesByArea',
                latitude,
                longitude,
                radius || '1000'
            );
            
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error querying vehicles by area:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Get traffic statistics
    async getTrafficStats(req, res) {
        try {
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            const result = await contract.evaluateTransaction('getTrafficStatistics');
            
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting traffic stats:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Update intersection state
    async updateIntersection(req, res) {
        try {
            const { intersectionId, state, duration } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            await contract.submitTransaction(
                'updateIntersectionState',
                intersectionId,
                state,
                duration ? duration.toString() : '30'
            );
            
            res.json({
                success: true,
                message: `Intersection ${intersectionId} updated to ${state}`
            });
        } catch (error) {
            console.error('Error updating intersection:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Report congestion
    async reportCongestion(req, res) {
        try {
            const { roadId, level, latitude, longitude } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            const timestamp = new Date().toISOString();
            await contract.submitTransaction(
                'reportCongestion',
                roadId,
                level,
                latitude.toString(),
                longitude.toString(),
                timestamp
            );
            
            res.json({
                success: true,
                message: `Congestion reported on ${roadId}`
            });
        } catch (error) {
            console.error('Error reporting congestion:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new TrafficController();
