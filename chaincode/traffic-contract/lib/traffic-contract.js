'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * TrafficContract - Smart Contract for Traffic Management
 * 
 * This contract manages:
 * - Traffic data recording (vehicle counts, speeds, congestion)
 * - Traffic light status updates
 * - Intersection monitoring
 * - Real-time traffic statistics
 * 
 * Deployed on: city-traffic-global channel
 * Organizations: TrafficAuthority, VehicleOperator, Infrastructure, Emergency, Parking
 */
class TrafficContract extends Contract {

    /**
     * Get deterministic timestamp from transaction context
     */

    /**
     * Initialize the ledger with sample data (optional)
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Traffic Ledger ===========');

        // Use transaction timestamp for deterministic initialization
        const intersections = [
            {
                intersectionId: 'INT001',
                name: 'Main St & 1st Ave',
                location: { latitude: 40.7128, longitude: -74.0060 },
                trafficLightStatus: 'GREEN',
                vehicleCount: 25,
                averageSpeed: 35,
                congestionLevel: 'LOW',
                organization: 'TrafficAuthority',
                history: []
            },
            {
                intersectionId: 'INT002',
                name: 'Broadway & 5th Ave',
                location: { latitude: 40.7614, longitude: -73.9776 },
                trafficLightStatus: 'RED',
                vehicleCount: 42,
                averageSpeed: 15,
                congestionLevel: 'MEDIUM',
                organization: 'TrafficAuthority',
                history: []
            }
        ];

        for (const intersection of intersections) {
            await ctx.stub.putState(
                intersection.intersectionId,
                Buffer.from(JSON.stringify(intersection))
            );
            console.info(`Added intersection: ${intersection.intersectionId}`);
        }

        console.info('============= END : Initialize Traffic Ledger ===========');
        return JSON.stringify({ message: 'Ledger initialized', count: intersections.length });
    }

    /**
     * Record traffic data at an intersection
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} intersectionId - Unique intersection identifier
     * @param {number} vehicleCount - Number of vehicles detected
     * @param {number} averageSpeed - Average speed in km/h
     * @param {string} congestionLevel - LOW, MEDIUM, HIGH, CRITICAL
     */
    async recordTrafficData(ctx, intersectionId, vehicleCount, averageSpeed, congestionLevel) {
        console.info('============= START : Record Traffic Data ===========');

        // Validate inputs
        if (!intersectionId || vehicleCount === undefined || averageSpeed === undefined || !congestionLevel) {
            throw new Error('Missing required parameters');
        }

        const vCount = parseInt(vehicleCount);
        const aSpeed = parseFloat(averageSpeed);

        // [SEC: SANITY CHECK] Lying Sensor Attack Mitigation
        if (vCount < 0 || vCount > 500) {
            throw new Error(`VALIDATION_FAILED: vehicleCount (${vCount}) is physically impossible (Range: 0-500)`);
        }
        if (aSpeed < 0 || aSpeed > 250) {
            throw new Error(`VALIDATION_FAILED: averageSpeed (${aSpeed}) is physically impossible (Range: 0-250)`);
        }

        // Validate congestion level
        const validCongestionLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        if (!validCongestionLevels.includes(congestionLevel.toUpperCase())) {
            throw new Error(`Invalid congestion level. Must be one of: ${validCongestionLevels.join(', ')}`);
        }

        // Get caller identity
        const clientIdentity = ctx.clientIdentity;
        const organization = clientIdentity.getMSPID();

        // Check if intersection exists
        const intersectionBytes = await ctx.stub.getState(intersectionId);
        let intersection;

        if (!intersectionBytes || intersectionBytes.length === 0) {
            // Create new intersection
            intersection = {
                intersectionId,
                name: `Intersection ${intersectionId}`,
                location: { latitude: 0, longitude: 0 },
                trafficLightStatus: 'UNKNOWN',
                vehicleCount: parseInt(vehicleCount),
                averageSpeed: parseFloat(averageSpeed),
                congestionLevel: congestionLevel.toUpperCase(),
                organization,
                history: []
            };
        } else {
            // Update existing intersection
            intersection = JSON.parse(intersectionBytes.toString());

            // Save current state to history
            intersection.history = intersection.history || [];
            intersection.history.push({
                vehicleCount: intersection.vehicleCount,
                averageSpeed: intersection.averageSpeed,
                congestionLevel: intersection.congestionLevel,
                timestamp: intersection.lastUpdated
            });

            // Keep only last 10 history entries
            if (intersection.history.length > 10) {
                intersection.history = intersection.history.slice(-10);
            }

            // Update with new data
            intersection.vehicleCount = parseInt(vehicleCount);
            intersection.averageSpeed = parseFloat(averageSpeed);
            intersection.congestionLevel = congestionLevel.toUpperCase();
            intersection.updatedBy = organization;
        }

        // Store updated intersection
        await ctx.stub.putState(intersectionId, Buffer.from(JSON.stringify(intersection)));

        console.info(`Traffic data recorded for ${intersectionId}`);
        console.info('============= END : Record Traffic Data ===========');

        return JSON.stringify(intersection);
    }

    /**
     * Update traffic light status
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} intersectionId - Unique intersection identifier
     * @param {string} status - Traffic light status: RED, YELLOW, GREEN
     */
    async updateTrafficLightStatus(ctx, intersectionId, status) {
        console.info('============= START : Update Traffic Light Status ===========');

        // Validate inputs
        if (!intersectionId || !status) {
            throw new Error('Missing required parameters: intersectionId and status');
        }

        // Validate status
        const validStatuses = ['RED', 'YELLOW', 'GREEN', 'FLASHING', 'OFF'];
        if (!validStatuses.includes(status.toUpperCase())) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // [SEC: AUTHORIZATION CHECK] Imposter Attack Mitigation
        const mspId = ctx.clientIdentity.getMSPID();
        const authorizedOrgs = ['TrafficAuthorityMSP', 'EmergencyServicesMSP'];
        if (!authorizedOrgs.includes(mspId)) {
            throw new Error(`SECURITY_DENIED: Organization ${mspId} is not authorized to update traffic lights.`);
        }

        // Check if intersection exists
        const intersectionBytes = await ctx.stub.getState(intersectionId);
        if (!intersectionBytes || intersectionBytes.length === 0) {
            throw new Error(`Intersection ${intersectionId} does not exist`);
        }

        // Update intersection
        const intersection = JSON.parse(intersectionBytes.toString());
        const oldStatus = intersection.trafficLightStatus;
        intersection.trafficLightStatus = status.toUpperCase();
        intersection.lightUpdatedBy = ctx.clientIdentity.getMSPID();

        // Store updated intersection
        await ctx.stub.putState(intersectionId, Buffer.from(JSON.stringify(intersection)));

        console.info(`Traffic light status updated: ${intersectionId} from ${oldStatus} to ${status}`);
        console.info('============= END : Update Traffic Light Status ===========');

        return JSON.stringify({
            intersectionId,
            oldStatus,
            newStatus: status.toUpperCase(),
            timestamp: intersection.lastUpdated
        });
    }

    /**
     * Create a new intersection
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} intersectionId - Unique intersection identifier
     * @param {string} name - Intersection name
     * @param {number} latitude - GPS latitude
     * @param {number} longitude - GPS longitude
     */
    async createIntersection(ctx, intersectionId, name, latitude, longitude) {
        console.info('============= START : Create Intersection ===========');

        // Validate inputs
        if (!intersectionId || !name || !latitude || !longitude) {
            throw new Error('Missing required parameters');
        }

        // Check if intersection already exists
        const exists = await ctx.stub.getState(intersectionId);
        if (exists && exists.length > 0) {
            throw new Error(`Intersection ${intersectionId} already exists`);
        }

        const intersection = {
            intersectionId,
            name,
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            trafficLightStatus: 'GREEN',
            vehicleCount: 0,
            averageSpeed: 0,
            congestionLevel: 'LOW',
            organization: ctx.clientIdentity.getMSPID(),
            history: []
        };

        await ctx.stub.putState(intersectionId, Buffer.from(JSON.stringify(intersection)));

        console.info(`Intersection created: ${intersectionId}`);
        console.info('============= END : Create Intersection ===========');

        return JSON.stringify(intersection);
    }

    /**
     * Query intersection by ID
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} intersectionId - Unique intersection identifier
     */
    async queryIntersection(ctx, intersectionId) {
        const intersectionBytes = await ctx.stub.getState(intersectionId);

        if (!intersectionBytes || intersectionBytes.length === 0) {
            throw new Error(`Intersection ${intersectionId} does not exist`);
        }

        return intersectionBytes.toString();
    }

    /**
     * Query all intersections
     * 
     * @param {Context} ctx - Transaction context
     */
    async queryAllIntersections(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include if it has intersectionId (to filter out non-intersection data)
                if (record.intersectionId) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(allResults);
    }

    /**
     * Query intersections by congestion level
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} congestionLevel - LOW, MEDIUM, HIGH, CRITICAL
     */
    async queryIntersectionsByCongestion(ctx, congestionLevel) {
        const queryString = {
            selector: {
                congestionLevel: congestionLevel.toUpperCase(),
                intersectionId: { $exists: true }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);

        return JSON.stringify(results);
    }

    /**
     * Get intersection history
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} intersectionId - Unique intersection identifier
     */
    async getIntersectionHistory(ctx, intersectionId) {
        const intersectionBytes = await ctx.stub.getState(intersectionId);

        if (!intersectionBytes || intersectionBytes.length === 0) {
            throw new Error(`Intersection ${intersectionId} does not exist`);
        }

        const intersection = JSON.parse(intersectionBytes.toString());
        return JSON.stringify(intersection.history || []);
    }

    /**
     * Get traffic statistics (aggregated data)
     * 
     * @param {Context} ctx - Transaction context
     */
    async getTrafficStatistics(ctx) {
        const allIntersections = JSON.parse(await this.queryAllIntersections(ctx));

        if (allIntersections.length === 0) {
            return JSON.stringify({
                totalIntersections: 0,
                totalVehicles: 0,
                averageSpeed: 0,
                congestionBreakdown: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
            });
        }

        const stats = {
            totalIntersections: allIntersections.length,
            totalVehicles: 0,
            averageSpeed: 0,
            congestionBreakdown: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
            trafficLightStatus: { RED: 0, YELLOW: 0, GREEN: 0, FLASHING: 0, OFF: 0, UNKNOWN: 0 }
        };

        let speedSum = 0;
        for (const intersection of allIntersections) {
            stats.totalVehicles += intersection.vehicleCount || 0;
            speedSum += intersection.averageSpeed || 0;

            if (intersection.congestionLevel) {
                stats.congestionBreakdown[intersection.congestionLevel] =
                    (stats.congestionBreakdown[intersection.congestionLevel] || 0) + 1;
            }

            if (intersection.trafficLightStatus) {
                stats.trafficLightStatus[intersection.trafficLightStatus] =
                    (stats.trafficLightStatus[intersection.trafficLightStatus] || 0) + 1;
            }
        }

        stats.averageSpeed = (speedSum / allIntersections.length).toFixed(2);

        return JSON.stringify(stats);
    }

    /**
     * Helper function to get all results from an iterator
     */
    async _getAllResults(iterator) {
        const allResults = [];
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                allResults.push(record);
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }

        await iterator.close();
        return allResults;
    }
}

module.exports = TrafficContract;

