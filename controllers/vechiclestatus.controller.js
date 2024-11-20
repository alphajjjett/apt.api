const VehicleStatus = require('../models/vehiclestatus.model'); // Import model VehicleStatus

// @desc    Get all vehicle statuses
// @route   GET /api/vehicle-statuses
// @access  Public
const getAllVehicleStatuses = async (req, res) => {
    try {
        const vehicleStatuses = await VehicleStatus.find().populate('vehicle_id', 'license_plate model');
        res.status(200).json(vehicleStatuses);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// @desc    Get a vehicle status by ID
// @route   GET /api/vehicle-statuses/:id
// @access  Public
const getVehicleStatusById = async (req, res) => {
    try {
        const vehicleStatus = await VehicleStatus.findById(req.params.id).populate('vehicle_id', 'license_plate model');
        if (!vehicleStatus) {
            return res.status(404).json({ message: 'Vehicle status not found' });
        }
        res.status(200).json(vehicleStatus);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// @desc    Create a new vehicle status
// @route   POST /api/vehicle-statuses
// @access  Public
const createVehicleStatus = async (req, res) => {
    const { vehicle_id, status } = req.body;
    
    try {
        const newVehicleStatus = new VehicleStatus({
            vehicle_id,
            status
        });

        await newVehicleStatus.save();
        res.status(201).json(newVehicleStatus);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// @desc    Update a vehicle status
// @route   PUT /api/vehicle-statuses/:id
// @access  Public
const updateVehicleStatus = async (req, res) => {
    const { vehicle_id, status } = req.body;

    try {
        const updatedVehicleStatus = await VehicleStatus.findByIdAndUpdate(
            req.params.id,
            { vehicle_id, status },
            { new: true }
        );

        if (!updatedVehicleStatus) {
            return res.status(404).json({ message: 'Vehicle status not found' });
        }

        res.status(200).json(updatedVehicleStatus);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// @desc    Delete a vehicle status
// @route   DELETE /api/vehicle-statuses/:id
// @access  Public
const deleteVehicleStatus = async (req, res) => {
    try {
        const vehicleStatus = await VehicleStatus.findByIdAndDelete(req.params.id);

        if (!vehicleStatus) {
            return res.status(404).json({ message: 'Vehicle status not found' });
        }

        res.status(200).json({ message: 'Vehicle status deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = {
    getAllVehicleStatuses,
    getVehicleStatusById,
    createVehicleStatus,
    updateVehicleStatus,
    deleteVehicleStatus
};
