const express = require('express');
const {
    getAllVehicleReturns,
    getVehicleReturnById,
    createVehicleReturn,
    updateVehicleReturn,
    deleteVehicleReturn
} = require('../controllers/vehiclereturn.controller');

const router = express.Router();

// @route   GET /api/vehicle-returns
// @desc    Get all vehicle returns
// @access  Public (คุณสามารถปรับให้เป็น Private ถ้าต้องการ authentication)
router.get('/', getAllVehicleReturns);

// @route   GET /api/vehicle-returns/:id
// @desc    Get vehicle return by ID
// @access  Public
router.get('/:id', getVehicleReturnById);

// @route   POST /api/vehicle-returns
// @desc    Create a new vehicle return
// @access  Public
router.post('/', createVehicleReturn);

// @route   PUT /api/vehicle-returns/:id
// @desc    Update a vehicle return by ID
// @access  Public
router.put('/:id', updateVehicleReturn);

// @route   DELETE /api/vehicle-returns/:id
// @desc    Delete a vehicle return by ID
// @access  Public
router.delete('/:id', deleteVehicleReturn);

module.exports = router;
