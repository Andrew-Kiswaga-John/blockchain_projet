/*
 * Vehicle Routes
 * REST endpoints for vehicle management
 */

const express = require('express');
const router = express.Router();
const fabricGateway = require('../utils/fabricGateway');
const logger = require('../utils/logger');

/**
 * GET /api/vehicles
 * Get all vehicles
 */
router.get('/', async (req, res) => {
    try {
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction('queryAllVehicles');
        const vehicles = JSON.parse(result.toString());
        
        res.json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        logger.error(`Error querying all vehicles: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vehicles/:id
 * Get a specific vehicle
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction('queryVehicle', id);
        const vehicle = JSON.parse(result.toString());
        
        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        logger.error(`Error querying vehicle ${req.params.id}: ${error.message}`);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/vehicles
 * Create a new vehicle
 */
router.post('/', async (req, res) => {
    try {
        const { vehicleId, vehicleType, lat, lng, status } = req.body;
        
        if (!vehicleId || !vehicleType || !lat || !lng || !status) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: vehicleId, vehicleType, lat, lng, status'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction(
            'createVehicle',
            vehicleId,
            vehicleType,
            lat.toString(),
            lng.toString(),
            status
        );
        
        const vehicle = JSON.parse(result.toString());
        
        // Emit event via WebSocket
        const io = req.app.get('io');
        io.to('vehicles').emit('vehicleCreated', vehicle);
        
        logger.info(`Vehicle created: ${vehicleId}`);
        
        res.status(201).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        logger.error(`Error creating vehicle: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/vehicles/:id/position
 * Update vehicle position
 */
router.put('/:id/position', async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng, speed, timestamp } = req.body;
        
        if (!lat || !lng || speed === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: lat, lng, speed'
            });
        }
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction(
            'updatePosition',
            id,
            lat.toString(),
            lng.toString(),
            speed.toString(),
            timestamp || new Date().toISOString()
        );
        
        const vehicle = JSON.parse(result.toString());
        
        // Emit event via WebSocket
        const io = req.app.get('io');
        io.to('vehicles').emit('positionUpdated', vehicle);
        
        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        logger.error(`Error updating vehicle position: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/vehicles/:id
 * Delete a vehicle
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.submitTransaction('deleteVehicle', id);
        const response = JSON.parse(result.toString());
        
        // Emit event via WebSocket
        const io = req.app.get('io');
        io.to('vehicles').emit('vehicleDeleted', { vehicleId: id });
        
        logger.info(`Vehicle deleted: ${id}`);
        
        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Error deleting vehicle: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vehicles/:id/history
 * Get vehicle transaction history
 */
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        
        await fabricGateway.connect();
        const contract = await fabricGateway.getContract();
        
        const result = await contract.evaluateTransaction('getVehicleHistory', id);
        const history = JSON.parse(result.toString());
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error(`Error querying vehicle history: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
