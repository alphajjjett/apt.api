const express = require('express');
const router = express.Router();
const {
        getFuelRecords,
        createFuelRecord,
        deleteFuelRecord,
        updateFuelRecordWithStatus
} = require('../controllers/fuel.controller');

// Get all fuel records
router.get('/', getFuelRecords);

// Create new fuel record
router.post('/:missionId', createFuelRecord);

router.put('/:id', updateFuelRecordWithStatus);


// Delete fuel record by ID
router.delete('/:id', deleteFuelRecord);

module.exports = router;
