const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');

// Intersection routes
router.get('/intersections', trafficController.getAllIntersections);
router.post('/intersections', trafficController.createIntersection);
router.get('/intersections/:intersectionId/history', trafficController.getIntersectionHistory);

// Traffic data routes
router.post('/data', trafficController.recordTrafficData);
router.put('/light', trafficController.updateTrafficLight);
router.get('/statistics', trafficController.getTrafficStats);

module.exports = router;
