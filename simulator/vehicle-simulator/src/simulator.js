const tangierData = require('./tangier-data');
const client = require('./client');

class TrafficSimulator {
    constructor() {
        this.intersections = tangierData.intersections.map(i => ({
            ...i,
            vehicleCount: 0,
            averageSpeed: 40,
            congestionLevel: 'LOW',
            lightStatus: 'GREEN',
            lastUpdate: Date.now()
        }));

        this.isRunning = false;
        this.isUpdating = false; // Lock to prevent overlapping intervals
        this.updateInterval = 5000; // 5 seconds
        this.lightInterval = 30000; // 30 seconds
    }

    start() {
        console.log('🚗 Starting Tangier Traffic Simulator...');
        console.log(`📍 City Center: ${tangierData.center.latitude}, ${tangierData.center.longitude}`);
        console.log(`🚦 Monitored Intersections: ${this.intersections.length}`);

        this.isRunning = true;

        // Traffic Data Loop
        setInterval(() => this.simulateTraffic(), this.updateInterval);

        // Traffic Light Loop
        setInterval(() => this.toggleLights(), this.lightInterval);
    }

    async simulateTraffic() {
        // Prevent overlapping updates if the previous batch is taking too long
        if (!this.isRunning || this.isUpdating) {
            if (this.isUpdating) console.log('⏳ Previous update still in progress, skipping tick...');
            return;
        }

        this.isUpdating = true;

        try {
            for (const intersection of this.intersections) {
                // Randomize traffic data
                const fluctuation = Math.floor(Math.random() * 10) - 3; // -3 to +6 vehicles
                intersection.vehicleCount = Math.max(0, intersection.vehicleCount + fluctuation);

                // Limit max vehicles for realism
                if (intersection.vehicleCount > 100) intersection.vehicleCount = 90;

                // Determine speed and congestion based on count
                if (intersection.vehicleCount < 20) {
                    intersection.congestionLevel = 'LOW';
                    intersection.averageSpeed = 40 + Math.random() * 10;
                } else if (intersection.vehicleCount < 50) {
                    intersection.congestionLevel = 'MEDIUM';
                    intersection.averageSpeed = 25 + Math.random() * 10;
                } else if (intersection.vehicleCount < 80) {
                    intersection.congestionLevel = 'HIGH';
                    intersection.averageSpeed = 10 + Math.random() * 10;
                } else {
                    intersection.congestionLevel = 'CRITICAL';
                    intersection.averageSpeed = 5 + Math.random() * 5;
                }

                // Sync with Blockchain via Backend
                // We await here to ensure sequential processing (avoids MVCC Conflict)
                await client.updateIntersection(intersection);

                // Small delay to be gentle on the ledger
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (err) {
            console.error('Error in simulation loop:', err.message);
        } finally {
            this.isUpdating = false;
        }
    }

    async toggleLights() {
        if (!this.isRunning || this.isUpdating) {
            if (this.isUpdating) console.log('⏳ Traffic lights blocked by ongoing update, retrying next cycle...');
            return;
        }

        this.isUpdating = true;

        try {
            for (const intersection of this.intersections) {
                const nextStatus = intersection.lightStatus === 'GREEN' ? 'RED' : 'GREEN';
                intersection.lightStatus = nextStatus;

                await client.updateTrafficLight(intersection.id, nextStatus);
                // Small delay to prevent network flood
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (err) {
            console.error('Error in traffic light loop:', err.message);
        } finally {
            this.isUpdating = false;
        }
    }
}

// Start the simulator
const sim = new TrafficSimulator();
sim.start();
