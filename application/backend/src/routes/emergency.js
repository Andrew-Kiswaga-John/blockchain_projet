const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

router.get('/statistics', emergencyController.getStatistics);
router.post('/create', emergencyController.createEmergency);
router.get('/active', emergencyController.getActiveEmergencies);
router.get('/:emergencyId', emergencyController.getEmergency);
router.put('/status', emergencyController.updateStatus);
router.post('/assign-vehicle', emergencyController.assignVehicle);

module.exports = router;
