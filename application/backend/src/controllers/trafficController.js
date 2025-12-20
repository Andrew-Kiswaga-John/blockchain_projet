const fabricClient = require('../fabric-sdk/fabricClient');

class TrafficController {
    
    // Get all intersections
    async getAllIntersections(req, res) {
        try {
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            const result = await contract.evaluateTransaction('queryAllIntersections');
            
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting intersections:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Create new intersection
    async createIntersection(req, res) {
        try {
            const { intersectionId, name, latitude, longitude } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            await contract.submitTransaction(
                'createIntersection', 
                intersectionId, 
                name, 
                latitude.toString(), 
                longitude.toString()
            );
            
            res.json({
                success: true,
                message: `Intersection ${intersectionId} created successfully`
            });
        } catch (error) {
            console.error('Error creating intersection:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Record traffic data
    async recordTrafficData(req, res) {
        try {
            const { intersectionId, vehicleCount, averageSpeed, congestionLevel } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            await contract.submitTransaction(
                'recordTrafficData',
                intersectionId,
                vehicleCount.toString(),
                averageSpeed.toString(),
                congestionLevel
            );
            
            res.json({
                success: true,
                message: `Traffic data recorded for ${intersectionId}`
            });
        } catch (error) {
            console.error('Error recording traffic data:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Update traffic light status
    async updateTrafficLight(req, res) {
        try {
            const { intersectionId, status } = req.body;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            
            await contract.submitTransaction(
                'updateTrafficLightStatus',
                intersectionId,
                status
            );
            
            res.json({
                success: true,
                message: `Traffic light updated for ${intersectionId}`
            });
        } catch (error) {
            console.error('Error updating traffic light:', error);
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

    // Get intersection history
    async getIntersectionHistory(req, res) {
        try {
            const { intersectionId } = req.params;
            const contract = await fabricClient.getContract('city-traffic-global', 'traffic-contract');
            const result = await contract.evaluateTransaction('getIntersectionHistory', intersectionId);
            
            res.json({
                success: true,
                data: JSON.parse(result.toString())
            });
        } catch (error) {
            console.error('Error getting intersection history:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new TrafficController();
