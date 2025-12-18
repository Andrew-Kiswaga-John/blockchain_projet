const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');

// Vehicle routes
router.get('/vehicles', trafficController.getAllVehicles);
router.post('/vehicles/register', trafficController.registerVehicle);
router.put('/vehicles/position', trafficController.updateVehiclePosition);
router.get('/vehicles/area', trafficController.queryVehiclesByArea);

// Traffic monitoring
router.get('/statistics', trafficController.getTrafficStats);
router.put('/intersections', trafficController.updateIntersection);
router.post('/congestion', trafficController.reportCongestion);

module.exports = router;
