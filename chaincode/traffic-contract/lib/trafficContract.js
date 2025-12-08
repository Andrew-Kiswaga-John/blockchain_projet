/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Traffic Contract - Smart contract for managing vehicles, traffic events, and infrastructure
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class TrafficContract extends Contract {

    /**
     * Initialize the ledger with sample data
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const fixedTimestamp = '2025-12-08T00:00:00.000Z';
        const vehicles = [
            {
                vehicleId: 'VEH001',
                vehicleType: 'sedan',
                position: { lat: 33.5731, lng: -7.5898 },
                speed: 45,
                status: 'moving',
                owner: 'TrafficMSP',
                timestamp: fixedTimestamp
            },
            {
                vehicleId: 'VEH002',
                vehicleType: 'truck',
                position: { lat: 33.5745, lng: -7.5920 },
                speed: 30,
                status: 'moving',
                owner: 'TrafficMSP',
                timestamp: fixedTimestamp
            },
            {
                vehicleId: 'VEH003',
                vehicleType: 'bus',
                position: { lat: 33.5720, lng: -7.5880 },
                speed: 35,
                status: 'stopped',
                owner: 'CityHallMSP',
                timestamp: fixedTimestamp
            },
            {
                vehicleId: 'EMG001',
                vehicleType: 'ambulance',
                position: { lat: 33.5760, lng: -7.5905 },
                speed: 60,
                status: 'emergency',
                owner: 'EmergencyMSP',
                timestamp: fixedTimestamp
            }
        ];

        for (const vehicle of vehicles) {
            vehicle.docType = 'vehicle';
            await ctx.stub.putState(vehicle.vehicleId, Buffer.from(JSON.stringify(vehicle)));
            console.info(`Vehicle ${vehicle.vehicleId} initialized`);
        }

        const intersections = [
            {
                intersectionId: 'INT001',
                location: { lat: 33.5735, lng: -7.5900 },
                signalStatus: 'green',
                lastUpdate: fixedTimestamp,
                docType: 'intersection'
            },
            {
                intersectionId: 'INT002',
                location: { lat: 33.5750, lng: -7.5910 },
                signalStatus: 'red',
                lastUpdate: fixedTimestamp,
                docType: 'intersection'
            }
        ];

        for (const intersection of intersections) {
            await ctx.stub.putState(intersection.intersectionId, Buffer.from(JSON.stringify(intersection)));
            console.info(`Intersection ${intersection.intersectionId} initialized`);
        }

        console.info('============= END : Initialize Ledger ===========');
        return JSON.stringify({ success: true, message: 'Ledger initialized successfully' });
    }

    /**
     * Create a new vehicle
     */
    async createVehicle(ctx, vehicleId, vehicleType, latStr, lngStr, speedStr, status, owner) {
        console.info('============= START : Create Vehicle ===========');

        // Check if vehicle already exists
        const exists = await this.vehicleExists(ctx, vehicleId);
        if (exists) {
            throw new Error(`Vehicle ${vehicleId} already exists`);
        }

        // Use provided owner or get from client identity
        const vehicleOwner = owner || ctx.clientIdentity.getMSPID();

        const vehicle = {
            vehicleId,
            vehicleType,
            position: { lat: parseFloat(latStr), lng: parseFloat(lngStr) },
            speed: parseInt(speedStr),
            status,
            owner: vehicleOwner,
            timestamp: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            docType: 'vehicle'
        };

        await ctx.stub.putState(vehicleId, Buffer.from(JSON.stringify(vehicle)));
        console.info(`Vehicle ${vehicleId} created successfully`);
        
        // Emit event
        ctx.stub.setEvent('VehicleCreated', Buffer.from(JSON.stringify(vehicle)));
        
        return JSON.stringify(vehicle);
    }

    /**
     * Update vehicle position
     */
    async updatePosition(ctx, vehicleId, latStr, lngStr, speedStr) {
        console.info('============= START : Update Position ===========');

        const vehicleAsBytes = await ctx.stub.getState(vehicleId);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`Vehicle ${vehicleId} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());
        
        // Update vehicle data
        vehicle.position = { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
        vehicle.speed = parseFloat(speedStr);
        vehicle.timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        await ctx.stub.putState(vehicleId, Buffer.from(JSON.stringify(vehicle)));
        console.info(`Vehicle ${vehicleId} position updated`);
        
        // Emit event
        ctx.stub.setEvent('PositionUpdated', Buffer.from(JSON.stringify(vehicle)));
        
        return JSON.stringify(vehicle);
    }

    /**
     * Query a specific vehicle
     */
    async queryVehicle(ctx, vehicleId) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleId);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`Vehicle ${vehicleId} does not exist`);
        }
        return vehicleAsBytes.toString();
    }

    /**
     * Query all vehicles
     */
    async queryAllVehicles(ctx) {
        const startKey = 'VEH';
        const endKey = 'VEHz';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }

    /**
     * Delete a vehicle
     */
    async deleteVehicle(ctx, vehicleId) {
        const exists = await this.vehicleExists(ctx, vehicleId);
        if (!exists) {
            throw new Error(`Vehicle ${vehicleId} does not exist`);
        }

        await ctx.stub.deleteState(vehicleId);
        console.info(`Vehicle ${vehicleId} deleted`);
        
        // Emit event
        ctx.stub.setEvent('VehicleDeleted', Buffer.from(JSON.stringify({ vehicleId })));
        
        return JSON.stringify({ success: true, message: `Vehicle ${vehicleId} deleted` });
    }

    /**
     * Check if vehicle exists
     */
    async vehicleExists(ctx, vehicleId) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleId);
        return vehicleAsBytes && vehicleAsBytes.length > 0;
    }

    /**
     * Record a traffic event (accident, congestion, etc.)
     */
    async recordTrafficEvent(ctx, eventId, eventType, latStr, lngStr, severity, description) {
        console.info('============= START : Record Traffic Event ===========');

        const clientMSP = ctx.clientIdentity.getMSPID();

        const trafficEvent = {
            eventId,
            eventType, // 'accident', 'congestion', 'construction', 'weather'
            location: { lat: parseFloat(latStr), lng: parseFloat(lngStr) },
            severity, // 'low', 'medium', 'high', 'critical'
            description,
            reportedBy: clientMSP,
            timestamp: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            status: 'active',
            docType: 'trafficEvent'
        };

        await ctx.stub.putState(eventId, Buffer.from(JSON.stringify(trafficEvent)));
        console.info(`Traffic event ${eventId} recorded`);
        
        // Emit event
        ctx.stub.setEvent('TrafficEventRecorded', Buffer.from(JSON.stringify(trafficEvent)));
        
        return JSON.stringify(trafficEvent);
    }

    /**
     * Query traffic events
     */
    async queryTrafficEvents(ctx) {
        const startKey = 'EVT';
        const endKey = 'EVTz';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }

    /**
     * Resolve a traffic event
     */
    async resolveTrafficEvent(ctx, eventId) {
        const eventAsBytes = await ctx.stub.getState(eventId);
        if (!eventAsBytes || eventAsBytes.length === 0) {
            throw new Error(`Traffic event ${eventId} does not exist`);
        }

        const trafficEvent = JSON.parse(eventAsBytes.toString());
        trafficEvent.status = 'resolved';
        trafficEvent.resolvedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        await ctx.stub.putState(eventId, Buffer.from(JSON.stringify(trafficEvent)));
        console.info(`Traffic event ${eventId} resolved`);
        
        // Emit event
        ctx.stub.setEvent('TrafficEventResolved', Buffer.from(JSON.stringify(trafficEvent)));
        
        return JSON.stringify(trafficEvent);
    }

    /**
     * Create an intersection
     */
    async createIntersection(ctx, intersectionId, latStr, lngStr, signalStatus) {
        console.info('============= START : Create Intersection ===========');

        const exists = await this.intersectionExists(ctx, intersectionId);
        if (exists) {
            throw new Error(`Intersection ${intersectionId} already exists`);
        }

        const intersection = {
            intersectionId,
            location: { lat: parseFloat(latStr), lng: parseFloat(lngStr) },
            signalStatus, // 'green', 'yellow', 'red'
            lastUpdate: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            docType: 'intersection'
        };

        await ctx.stub.putState(intersectionId, Buffer.from(JSON.stringify(intersection)));
        console.info(`Intersection ${intersectionId} created`);
        
        return JSON.stringify(intersection);
    }

    /**
     * Update signal status at an intersection
     */
    async updateSignalStatus(ctx, intersectionId, signalStatus) {
        const intersectionAsBytes = await ctx.stub.getState(intersectionId);
        if (!intersectionAsBytes || intersectionAsBytes.length === 0) {
            throw new Error(`Intersection ${intersectionId} does not exist`);
        }

        const intersection = JSON.parse(intersectionAsBytes.toString());
        intersection.signalStatus = signalStatus;
        intersection.lastUpdate = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

        await ctx.stub.putState(intersectionId, Buffer.from(JSON.stringify(intersection)));
        console.info(`Intersection ${intersectionId} signal updated to ${signalStatus}`);
        
        // Emit event
        ctx.stub.setEvent('SignalStatusUpdated', Buffer.from(JSON.stringify(intersection)));
        
        return JSON.stringify(intersection);
    }

    /**
     * Query an intersection
     */
    async queryIntersection(ctx, intersectionId) {
        const intersectionAsBytes = await ctx.stub.getState(intersectionId);
        if (!intersectionAsBytes || intersectionAsBytes.length === 0) {
            throw new Error(`Intersection ${intersectionId} does not exist`);
        }
        return intersectionAsBytes.toString();
    }

    /**
     * Query all intersections
     */
    async queryAllIntersections(ctx) {
        const startKey = 'INT';
        const endKey = 'INTz';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }

    /**
     * Check if intersection exists
     */
    async intersectionExists(ctx, intersectionId) {
        const intersectionAsBytes = await ctx.stub.getState(intersectionId);
        return intersectionAsBytes && intersectionAsBytes.length > 0;
    }

    /**
     * Get traffic density in an area (simplified calculation)
     */
    async getTrafficDensity(ctx, latStr, lngStr, radiusKm) {
        const centerLat = parseFloat(latStr);
        const centerLng = parseFloat(lngStr);
        const radius = parseFloat(radiusKm);

        // Query all vehicles
        const vehiclesJson = await this.queryAllVehicles(ctx);
        const vehicles = JSON.parse(vehiclesJson);

        // Count vehicles within radius
        let count = 0;
        for (const vehicle of vehicles) {
            const distance = this.calculateDistance(
                centerLat, centerLng,
                vehicle.position.lat, vehicle.position.lng
            );
            if (distance <= radius) {
                count++;
            }
        }

        const density = {
            location: { lat: centerLat, lng: centerLng },
            radiusKm: radius,
            vehicleCount: count,
            density: count / (Math.PI * radius * radius), // vehicles per sq km
            timestamp: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()
        };

        return JSON.stringify(density);
    }

    /**
     * Calculate distance between two points (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get average speed in an area
     */
    async getAverageSpeed(ctx, latStr, lngStr, radiusKm) {
        const centerLat = parseFloat(latStr);
        const centerLng = parseFloat(lngStr);
        const radius = parseFloat(radiusKm);

        const vehiclesJson = await this.queryAllVehicles(ctx);
        const vehicles = JSON.parse(vehiclesJson);

        let totalSpeed = 0;
        let count = 0;

        for (const vehicle of vehicles) {
            const distance = this.calculateDistance(
                centerLat, centerLng,
                vehicle.position.lat, vehicle.position.lng
            );
            if (distance <= radius) {
                totalSpeed += vehicle.speed;
                count++;
            }
        }

        const avgSpeed = count > 0 ? totalSpeed / count : 0;

        const result = {
            location: { lat: centerLat, lng: centerLng },
            radiusKm: radius,
            vehicleCount: count,
            averageSpeed: avgSpeed,
            timestamp: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()
        };

        return JSON.stringify(result);
    }

    /**
     * Get transaction history for a vehicle
     */
    async getVehicleHistory(ctx, vehicleId) {
        const iterator = await ctx.stub.getHistoryForKey(vehicleId);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            const record = {
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                isDelete: result.value.isDelete,
                value: result.value.value.toString('utf8')
            };
            history.push(record);
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(history);
    }
}

module.exports = TrafficContract;
