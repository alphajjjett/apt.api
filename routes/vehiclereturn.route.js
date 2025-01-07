const express = require('express');
const {
    getAllVehicleReturns,
    getVehicleReturnById,
    createVehicleReturn,
    updateVehicleReturn,
    deleteVehicleReturn
} = require('../controllers/vehiclereturn.controller');

const router = express.Router();


router.get('/', getAllVehicleReturns);


router.get('/:id', getVehicleReturnById);


router.post('/', createVehicleReturn);


router.put('/:id', updateVehicleReturn);

router.delete('/:id', deleteVehicleReturn);

module.exports = router;
