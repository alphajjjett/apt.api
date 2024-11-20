const express = require('express');
const {
    getAllVehicleStatuses,
    getVehicleStatusById,
    createVehicleStatus,
    updateVehicleStatus,
    deleteVehicleStatus
} = require('../controllers/vechiclestatus.controller');

const router = express.Router();

router.get('/', getAllVehicleStatuses);
router.get('/:id', getVehicleStatusById);
router.post('/', createVehicleStatus);
router.put('/:id', updateVehicleStatus);
router.delete('/:id', deleteVehicleStatus);

module.exports = router;
