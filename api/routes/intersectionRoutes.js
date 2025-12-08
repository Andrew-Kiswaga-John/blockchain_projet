/*
 * Intersection Routes
 * REST endpoints for intersection and signal management
 */

const express = require('express');
const router = express.Router();
const fabricGateway = require('../utils/fabricGateway');
const logger = require('../utils/logger');

/**
 * GET /api/intersections
 * Get all intersections
 */
router.get('/', async (req, res) => {
    try {
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction('queryAllIntersections');
        const intersections = JSON.parse(result.toString());
        
        res.json({
            success: true,
            count: intersections.length,
            data: intersections
        });
    } catch (error) {
        logger.error(`Error querying intersections: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/intersections/:id
 * Get a specific intersection
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction('queryIntersection', id);
        const intersection = JSON.parse(result.toString());
        
        res.json({
            success: true,
            data: intersection
        });
    } catch (error) {
        logger.error(`Error querying intersection ${req.params.id}: ${error.message}`);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/intersections
 * Create a new intersection
 */
router.post('/', async (req, res) => {
    try {
        const { intersectionId, lat, lng, signalStatus } = req.body;
        
        if (!intersectionId || !lat || !lng || !signalStatus) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: intersectionId, lat, lng, signalStatus'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction(
            'createIntersection',
            intersectionId,
            lat.toString(),
            lng.toString(),
            signalStatus
        );
        
        const intersection = JSON.parse(result.toString());
        
        logger.info(`Intersection created: ${intersectionId}`);
        
        res.status(201).json({
            success: true,
            data: intersection
        });
    } catch (error) {
        logger.error(`Error creating intersection: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/intersections/:id/signal
 * Update signal status at an intersection
 */
router.put('/:id/signal', async (req, res) => {
    try {
        const { id } = req.params;
        const { signalStatus } = req.body;
        
        if (!signalStatus) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: signalStatus'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction(
            'updateSignalStatus',
            id,
            signalStatus
        );
        
        const intersection = JSON.parse(result.toString());
        
        // Emit event via WebSocket
        const io = req.app.get('io');
        io.to('intersections').emit('signalStatusUpdated', intersection);
        
        logger.info(`Signal status updated for intersection ${id}: ${signalStatus}`);
        
        res.json({
            success: true,
            data: intersection
        });
    } catch (error) {
        logger.error(`Error updating signal status: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
