const axios = require('axios');

const API_URL = process.env.API_URL || 'http://127.0.0.1:3000/api';

class TrafficClient {
    async updateIntersection(intersection) {
        try {
            await axios.post(`${API_URL}/traffic/data`, {
                intersectionId: intersection.id,
                vehicleCount: intersection.vehicleCount,
                averageSpeed: intersection.averageSpeed,
                congestionLevel: intersection.congestionLevel
            });
            console.log(`[INFRA] Updated ${intersection.name}: ${intersection.congestionLevel}`);
        } catch (error) {
            console.error(`[ERROR] Failed to update intersection ${intersection.id}:`, error.message);
        }
    }

    async updateTrafficLight(intersectionId, status) {
        try {
            await axios.put(`${API_URL}/traffic/light`, {
                intersectionId,
                status
            });
            console.log(`[LIGHT] ${intersectionId} changed to ${status}`);
        } catch (error) {
            console.error(`[ERROR] Failed to update light ${intersectionId}:`, error.message);
        }
    }

    async registerVehicle(vehicle) {
        // Mock registration logic if needed
    }
}

module.exports = new TrafficClient();
