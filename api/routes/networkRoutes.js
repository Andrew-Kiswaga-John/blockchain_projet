/*
 * Network Routes
 * REST endpoints for network status and blockchain information
 */

const express = require('express');
const router = express.Router();
const fabricGateway = require('../utils/fabricGateway');
const logger = require('../utils/logger');

/**
 * GET /api/network/status
 * Get network status
 */
router.get('/status', async (req, res) => {
    try {
        await fabricGateway.connect();
        
        res.json({
            success: true,
            data: {
                connected: true,
                timestamp: new Date().toISOString(),
                channel: process.env.CHANNEL_NAME || 'traffic-channel',
                chaincode: process.env.CHAINCODE_NAME || 'traffic-contract',
                organization: process.env.ORG_NAME || 'TrafficMSP'
            }
        });
    } catch (error) {
        logger.error(`Error getting network status: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/network/enroll-admin
 * Enroll admin user
 */
router.post('/enroll-admin', async (req, res) => {
    try {
        const { orgName, caName } = req.body;
        
        await fabricGateway.enrollAdmin(
            orgName || 'TrafficMSP',
            caName || 'ca.traffic.example.com'
        );
        
        res.json({
            success: true,
            message: 'Admin enrolled successfully'
        });
    } catch (error) {
        logger.error(`Error enrolling admin: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/network/enroll-user
 * Enroll a user
 */
router.post('/enroll-user', async (req, res) => {
    try {
        const { userName, orgName, caName } = req.body;
        
        if (!userName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userName'
            });
        }
        
        await fabricGateway.enrollUser(
            userName,
            orgName || 'TrafficMSP',
            caName || 'ca.traffic.example.com'
        );
        
        res.json({
            success: true,
            message: `User ${userName} enrolled successfully`
        });
    } catch (error) {
        logger.error(`Error enrolling user: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/network/info
 * Get blockchain network information
 */
router.get('/info', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                networkName: 'Traffic Core Network',
                organizations: [
                    { name: 'TrafficOrg', mspId: 'TrafficMSP', domain: 'traffic.example.com' },
                    { name: 'CityHallOrg', mspId: 'CityHallMSP', domain: 'cityhall.example.com' },
                    { name: 'PoliceOrg', mspId: 'PoliceMSP', domain: 'police.example.com' },
                    { name: 'EmergencyOrg', mspId: 'EmergencyMSP', domain: 'emergency.example.com' }
                ],
                channels: [
                    { name: 'traffic-channel', members: ['TrafficMSP', 'CityHallMSP', 'PoliceMSP', 'EmergencyMSP'] },
                    { name: 'admin-channel', members: ['TrafficMSP', 'CityHallMSP', 'PoliceMSP'] }
                ],
                consensus: 'Raft',
                orderers: 3,
                totalPeers: 8
            }
        });
    } catch (error) {
        logger.error(`Error getting network info: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
