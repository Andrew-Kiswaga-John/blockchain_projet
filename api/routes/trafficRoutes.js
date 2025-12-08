/*
 * Traffic Routes
 * REST endpoints for traffic event management
 */

const express = require('express');
const router = express.Router();
const fabricGateway = require('../utils/fabricGateway');
const logger = require('../utils/logger');

/**
 * GET /api/traffic/events
 * Get all traffic events
 */
router.get('/events', async (req, res) => {
    try {
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction('queryTrafficEvents');
        const events = JSON.parse(result.toString());
        
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        logger.error(`Error querying traffic events: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/traffic/events
 * Record a new traffic event
 */
router.post('/events', async (req, res) => {
    try {
        const { eventId, eventType, lat, lng, severity, description } = req.body;
        
        if (!eventId || !eventType || !lat || !lng || !severity) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: eventId, eventType, lat, lng, severity'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction(
            'recordTrafficEvent',
            eventId,
            eventType,
            lat.toString(),
            lng.toString(),
            severity,
            description || ''
        );
        
        const event = JSON.parse(result.toString());
        
        // Emit event via WebSocket
        const io = req.app.get('io');
        io.to('traffic').emit('trafficEventRecorded', event);
        
        logger.info(`Traffic event recorded: ${eventId}`);
        
        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        logger.error(`Error recording traffic event: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/traffic/events/:id/resolve
 * Resolve a traffic event
 */
router.put('/events/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction('resolveTrafficEvent', id);
        const event = JSON.parse(result.toString());
        
        // Emit event via WebSocket
        const io = req.app.get('io');
        io.to('traffic').emit('trafficEventResolved', event);
        
        logger.info(`Traffic event resolved: ${id}`);
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        logger.error(`Error resolving traffic event: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/traffic/density
 * Get traffic density for a specific area
 */
router.get('/density', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        
        if (!lat || !lng || !radius) {
            return res.status(400).json({
                success: false,
                error: 'Missing required query parameters: lat, lng, radius'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction(
            'getTrafficDensity',
            lat.toString(),
            lng.toString(),
            radius.toString()
        );
        
        const density = JSON.parse(result.toString());
        
        res.json({
            success: true,
            data: density
        });
    } catch (error) {
        logger.error(`Error calculating traffic density: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/traffic/speed
 * Get average speed for a specific area
 */
router.get('/speed', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        
        if (!lat || !lng || !radius) {
            return res.status(400).json({
                success: false,
                error: 'Missing required query parameters: lat, lng, radius'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction(
            'getAverageSpeed',
            lat.toString(),
            lng.toString(),
            radius.toString()
        );
        
        const speedData = JSON.parse(result.toString());
        
        res.json({
            success: true,
            data: speedData
        });
    } catch (error) {
        logger.error(`Error calculating average speed: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
