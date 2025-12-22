'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * EmergencyContract - Smart Contract for Emergency Services Coordination
 * 
 * This contract manages:
 * - Emergency alerts and incidents
 * - Priority route requests
 * - Emergency vehicle tracking
 * - Coordination between Emergency Services, Traffic Authority, and Infrastructure
 * 
 * Deployed on: emergency-channel
 * Organizations: EmergencyServices, TrafficAuthority, InfrastructureOperator
 */
class EmergencyContract extends Contract {

    /**
     * Initialize the ledger with sample data (optional)
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Emergency Ledger ===========');

        const emergencies = [
            {
                emergencyId: 'EMG001',
                type: 'FIRE',
                severity: 'HIGH',
                location: { latitude: 40.7128, longitude: -74.0060, address: 'Main St & 1st Ave' },
                status: 'ACTIVE',
                vehicleId: 'FIRE-TRUCK-01',
                routeStatus: 'EN_ROUTE',
                requestedBy: 'EmergencyServicesMSP',
                createdAt: '2025-01-01T00:00:00Z',
                updates: []
            }
        ];

        for (const emergency of emergencies) {
            await ctx.stub.putState(
                emergency.emergencyId,
                Buffer.from(JSON.stringify(emergency))
            );
            console.info(`Added emergency: ${emergency.emergencyId}`);
        }

        console.info('============= END : Initialize Emergency Ledger ===========');
        return JSON.stringify({ message: 'Emergency ledger initialized', count: emergencies.length });
    }

    /**
     * Create a new emergency alert
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     * @param {string} type - Emergency type: FIRE, MEDICAL, POLICE, ACCIDENT, OTHER
     * @param {string} severity - LOW, MEDIUM, HIGH, CRITICAL
     * @param {number} latitude - GPS latitude
     * @param {number} longitude - GPS longitude
     * @param {string} address - Location address
     * @param {string} description - Emergency description
     */
    async createEmergency(ctx, emergencyId, type, severity, latitude, longitude, address, description) {
        console.info('============= START : Create Emergency ===========');

        // Validate inputs
        if (!emergencyId || !type || !severity || !latitude || !longitude) {
            throw new Error('Missing required parameters');
        }

        // Validate emergency type
        const validTypes = ['FIRE', 'MEDICAL', 'POLICE', 'ACCIDENT', 'HAZMAT', 'NATURAL_DISASTER', 'OTHER'];
        if (!validTypes.includes(type.toUpperCase())) {
            throw new Error(`Invalid emergency type. Must be one of: ${validTypes.join(', ')}`);
        }

        // Validate severity
        const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        if (!validSeverities.includes(severity.toUpperCase())) {
            throw new Error(`Invalid severity. Must be one of: ${validSeverities.join(', ')}`);
        }

        // Check if emergency already exists
        const exists = await ctx.stub.getState(emergencyId);
        if (exists && exists.length > 0) {
            throw new Error(`Emergency ${emergencyId} already exists`);
        }

        // Get caller identity
        const organization = ctx.clientIdentity.getMSPID();

        const emergency = {
            emergencyId,
            type: type.toUpperCase(),
            severity: severity.toUpperCase(),
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address: address || 'Unknown'
            },
            description: description || '',
            status: 'ACTIVE',
            vehicleId: null,
            routeStatus: 'PENDING',
            estimatedArrival: null,
            requestedBy: organization,
            createdAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            updates: []
        };

        await ctx.stub.putState(emergencyId, Buffer.from(JSON.stringify(emergency)));

        console.info(`Emergency created: ${emergencyId}`);
        console.info('============= END : Create Emergency ===========');

        // Emit event for emergency creation
        const eventPayload = Buffer.from(JSON.stringify({
            emergencyId,
            type: emergency.type,
            severity: emergency.severity, timestamp: ctx.stub.getTxID()
        }));
        ctx.stub.setEvent('EmergencyCreated', eventPayload);

        return JSON.stringify(emergency);
    }

    /**
     * Assign emergency vehicle to an incident
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     * @param {string} vehicleId - Emergency vehicle identifier
     */
    async assignVehicle(ctx, emergencyId, vehicleId) {
        console.info('============= START : Assign Vehicle ===========');

        if (!emergencyId || !vehicleId) {
            throw new Error('Missing required parameters: emergencyId and vehicleId');
        }

        // Get emergency
        const emergencyBytes = await ctx.stub.getState(emergencyId);
        if (!emergencyBytes || emergencyBytes.length === 0) {
            throw new Error(`Emergency ${emergencyId} does not exist`);
        }

        const emergency = JSON.parse(emergencyBytes.toString());

        // Check if emergency is still active
        if (emergency.status === 'RESOLVED' || emergency.status === 'CANCELLED') {
            throw new Error(`Cannot assign vehicle to ${emergency.status} emergency`);
        }

        // Add update to history
        emergency.updates = emergency.updates || [];
        emergency.updates.push({
            action: 'VEHICLE_ASSIGNED',
            vehicleId,
            timestamp: ctx.stub.getTxID(),
            organization: ctx.clientIdentity.getMSPID()
        });

        // Update emergency
        emergency.vehicleId = vehicleId;
        emergency.routeStatus = 'ASSIGNED';

        await ctx.stub.putState(emergencyId, Buffer.from(JSON.stringify(emergency)));

        console.info(`Vehicle ${vehicleId} assigned to ${emergencyId}`);
        console.info('============= END : Assign Vehicle ===========');

        // Emit event
        const eventPayload = Buffer.from(JSON.stringify({
            emergencyId,
            vehicleId, timestamp: ctx.stub.getTxID()
        }));
        ctx.stub.setEvent('VehicleAssigned', eventPayload);

        return JSON.stringify(emergency);
    }

    /**
     * Request priority route for emergency vehicle
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     * @param {string} routeData - JSON string with route information
     */
    async requestPriorityRoute(ctx, emergencyId, routeData) {
        console.info('============= START : Request Priority Route ===========');

        if (!emergencyId || !routeData) {
            throw new Error('Missing required parameters');
        }

        // Get emergency
        const emergencyBytes = await ctx.stub.getState(emergencyId);
        if (!emergencyBytes || emergencyBytes.length === 0) {
            throw new Error(`Emergency ${emergencyId} does not exist`);
        }

        const emergency = JSON.parse(emergencyBytes.toString());

        // Parse route data
        let route;
        try {
            route = JSON.parse(routeData);
        } catch (error) {
            throw new Error('Invalid route data format. Must be valid JSON');
        }

        // Add update to history
        emergency.updates = emergency.updates || [];
        emergency.updates.push({
            action: 'PRIORITY_ROUTE_REQUESTED',
            route,
            timestamp: ctx.stub.getTxID(),
            organization: ctx.clientIdentity.getMSPID()
        });

        // Update emergency
        emergency.routeStatus = 'EN_ROUTE';
        emergency.priorityRoute = route;
        emergency.estimatedArrival = route.estimatedArrival || null;

        await ctx.stub.putState(emergencyId, Buffer.from(JSON.stringify(emergency)));

        console.info(`Priority route requested for ${emergencyId}`);
        console.info('============= END : Request Priority Route ===========');

        // Emit event
        const eventPayload = Buffer.from(JSON.stringify({
            emergencyId,
            routeStatus: 'EN_ROUTE',
            estimatedArrival: emergency.estimatedArrival, timestamp: ctx.stub.getTxID()
        }));
        ctx.stub.setEvent('PriorityRouteRequested', eventPayload);

        return JSON.stringify(emergency);
    }

    /**
     * Update emergency vehicle location
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     * @param {number} latitude - Current GPS latitude
     * @param {number} longitude - Current GPS longitude
     */
    async updateVehicleLocation(ctx, emergencyId, latitude, longitude) {
        console.info('============= START : Update Vehicle Location ===========');

        if (!emergencyId || !latitude || !longitude) {
            throw new Error('Missing required parameters');
        }

        // Get emergency
        const emergencyBytes = await ctx.stub.getState(emergencyId);
        if (!emergencyBytes || emergencyBytes.length === 0) {
            throw new Error(`Emergency ${emergencyId} does not exist`);
        }

        const emergency = JSON.parse(emergencyBytes.toString());

        if (!emergency.vehicleId) {
            throw new Error('No vehicle assigned to this emergency');
        }

        // Initialize vehicle tracking
        emergency.vehicleTracking = emergency.vehicleTracking || [];

        // Add location update
        emergency.vehicleTracking.push({
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timestamp: ctx.stub.getTxID()
        });

        // Keep only last 50 location updates
        if (emergency.vehicleTracking.length > 50) {
            emergency.vehicleTracking = emergency.vehicleTracking.slice(-50);
        }

        emergency.currentLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };

        await ctx.stub.putState(emergencyId, Buffer.from(JSON.stringify(emergency)));

        console.info(`Vehicle location updated for ${emergencyId}`);
        console.info('============= END : Update Vehicle Location ===========');

        return JSON.stringify({
            emergencyId,
            vehicleId: emergency.vehicleId,
            currentLocation: emergency.currentLocation, timestamp: ctx.stub.getTxID()
        });
    }

    /**
     * Update emergency status
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     * @param {string} status - New status: ACTIVE, ARRIVED, RESOLVED, CANCELLED
     * @param {string} notes - Status update notes
     */
    async updateEmergencyStatus(ctx, emergencyId, status, notes) {
        console.info('============= START : Update Emergency Status ===========');

        if (!emergencyId || !status) {
            throw new Error('Missing required parameters: emergencyId and status');
        }

        // Validate status
        const validStatuses = ['ACTIVE', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Get emergency
        const emergencyBytes = await ctx.stub.getState(emergencyId);
        if (!emergencyBytes || emergencyBytes.length === 0) {
            throw new Error(`Emergency ${emergencyId} does not exist`);
        }

        const emergency = JSON.parse(emergencyBytes.toString());
        const oldStatus = emergency.status;

        // Add update to history
        emergency.updates = emergency.updates || [];
        emergency.updates.push({
            action: 'STATUS_UPDATED',
            oldStatus,
            newStatus: status.toUpperCase(),
            notes: notes || '',
            timestamp: ctx.stub.getTxID(),
            organization: ctx.clientIdentity.getMSPID()
        });

        // Update emergency
        emergency.status = status.toUpperCase();

        if (status.toUpperCase() === 'RESOLVED') {
            emergency.routeStatus = 'COMPLETED';
        } else if (status.toUpperCase() === 'CANCELLED') {
            emergency.routeStatus = 'CANCELLED';
        } else if (status.toUpperCase() === 'ARRIVED') {
            // Vehicle arrived at scene
        }

        await ctx.stub.putState(emergencyId, Buffer.from(JSON.stringify(emergency)));

        console.info(`Emergency status updated: ${emergencyId} from ${oldStatus} to ${status}`);
        console.info('============= END : Update Emergency Status ===========');

        // Emit event
        const eventPayload = Buffer.from(JSON.stringify({
            emergencyId,
            oldStatus,
            newStatus: status.toUpperCase(), timestamp: ctx.stub.getTxID()
        }));
        ctx.stub.setEvent('EmergencyStatusUpdated', eventPayload);

        return JSON.stringify(emergency);
    }

    /**
     * Query emergency by ID
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     */
    async queryEmergency(ctx, emergencyId) {
        const emergencyBytes = await ctx.stub.getState(emergencyId);

        if (!emergencyBytes || emergencyBytes.length === 0) {
            throw new Error(`Emergency ${emergencyId} does not exist`);
        }

        return emergencyBytes.toString();
    }

    /**
     * Query all active emergencies
     * 
     * @param {Context} ctx - Transaction context
     */
    async queryActiveEmergencies(ctx) {
        const queryString = {
            selector: {
                emergencyId: { $exists: true },
                status: { $in: ['ACTIVE', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED'] }
            },
            sort: [{ createdAt: 'desc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);

        return JSON.stringify(results);
    }

    /**
     * Query emergencies by type
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} type - Emergency type
     */
    async queryEmergenciesByType(ctx, type) {
        const queryString = {
            selector: {
                emergencyId: { $exists: true },
                type: type.toUpperCase()
            },
            sort: [{ createdAt: 'desc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);

        return JSON.stringify(results);
    }

    /**
     * Query emergencies by severity
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} severity - Severity level
     */
    async queryEmergenciesBySeverity(ctx, severity) {
        const queryString = {
            selector: {
                emergencyId: { $exists: true },
                severity: severity.toUpperCase()
            },
            sort: [{ createdAt: 'desc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);

        return JSON.stringify(results);
    }

    /**
     * Get emergency statistics
     * 
     * @param {Context} ctx - Transaction context
     */
    async getEmergencyStatistics(ctx) {
        const startKey = '';
        const endKey = '';
        const allEmergencies = [];

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            try {
                const record = JSON.parse(strValue);
                if (record.emergencyId) {
                    allEmergencies.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }

        await iterator.close();

        // Calculate statistics
        const stats = {
            total: allEmergencies.length,
            active: 0,
            resolved: 0,
            cancelled: 0,
            byType: {},
            bySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
            averageResponseTime: 0
        };

        let responseTimeSum = 0;
        let responseTimeCount = 0;

        for (const emergency of allEmergencies) {
            // Count by status
            if (emergency.status === 'ACTIVE' || emergency.status === 'ASSIGNED' ||
                emergency.status === 'EN_ROUTE' || emergency.status === 'ARRIVED') {
                stats.active++;
            } else if (emergency.status === 'RESOLVED') {
                stats.resolved++;
            } else if (emergency.status === 'CANCELLED') {
                stats.cancelled++;
            }

            // Count by type
            stats.byType[emergency.type] = (stats.byType[emergency.type] || 0) + 1;

            // Count by severity
            if (emergency.severity) {
                stats.bySeverity[emergency.severity]++;
            }

            // Calculate response time
            if (emergency.arrivedAt && emergency.createdAt) {
                const responseTime = new Date(emergency.arrivedAt) - new Date(emergency.createdAt);
                responseTimeSum += responseTime;
                responseTimeCount++;
            }
        }

        if (responseTimeCount > 0) {
            stats.averageResponseTime = Math.round((responseTimeSum / responseTimeCount) / 60000); // in minutes
        }

        return JSON.stringify(stats);
    }

    /**
     * Get emergency updates history
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} emergencyId - Unique emergency identifier
     */
    async getEmergencyHistory(ctx, emergencyId) {
        const emergencyBytes = await ctx.stub.getState(emergencyId);

        if (!emergencyBytes || emergencyBytes.length === 0) {
            throw new Error(`Emergency ${emergencyId} does not exist`);
        }

        const emergency = JSON.parse(emergencyBytes.toString());
        return JSON.stringify(emergency.updates || []);
    }

    /**
     * Helper function to get all results from an iterator
     */
    async _getAllResults(iterator) {
        const allResults = [];
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            try {
                const record = JSON.parse(strValue);
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

module.exports = EmergencyContract;



