const express = require('express');
const router = express.Router();
const consensusController = require('../controllers/consensusController');

router.post('/raft', consensusController.runRaftTest);
router.post('/poa', consensusController.runPoATest);
router.post('/pbft', consensusController.runPBFTTest);
// router.post('/liveness', consensusController.runLivenessTest);

module.exports = router;
