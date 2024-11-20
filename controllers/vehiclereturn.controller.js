const VehicleReturn = require('../models/vehiclereturn.model');


const getAllVehicleReturns = async (req, res) => {
    try {
        const vehicleReturns = await VehicleReturn.find()
            .populate('booking_id', 'start_time end_time')
            .populate('vehicle_id', 'license_plate model')
            .populate('user_id', 'name email');
        res.status(200).json(vehicleReturns);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// Get a single vehicle return by ID
const getVehicleReturnById = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicleReturn = await VehicleReturn.findById(id)
            .populate('booking_id', 'start_time end_time')
            .populate('vehicle_id', 'license_plate model')
            .populate('user_id', 'name email');

        if (!vehicleReturn) {
            return res.status(404).json({ message: 'Vehicle return not found' });
        }

        res.status(200).json(vehicleReturn);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// Create a new vehicle return
const createVehicleReturn = async (req, res) => {
    const { booking_id, vehicle_id, user_id, return_date, condition, fuel_level, remark } = req.body;

    try {
        const newVehicleReturn = new VehicleReturn({
            booking_id,
            vehicle_id,
            user_id,
            return_date,
            condition,
            fuel_level,
            remark
        });

        await newVehicleReturn.save();
        res.status(201).json(newVehicleReturn);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// Update an existing vehicle return by ID
const updateVehicleReturn = async (req, res) => {
    const { id } = req.params;
    const { booking_id, vehicle_id, user_id, return_date, condition, fuel_level, remark } = req.body;

    try {
        const updatedVehicleReturn = await VehicleReturn.findByIdAndUpdate(
            id,
            { booking_id, vehicle_id, user_id, return_date, condition, fuel_level, remark },
            { new: true } // Return the updated document
        );

        if (!updatedVehicleReturn) {
            return res.status(404).json({ message: 'Vehicle return not found' });
        }

        res.status(200).json(updatedVehicleReturn);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// Delete a vehicle return by ID
const deleteVehicleReturn = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedVehicleReturn = await VehicleReturn.findByIdAndDelete(id);

        if (!deletedVehicleReturn) {
            return res.status(404).json({ message: 'Vehicle return not found' });
        }

        res.status(200).json({ message: 'Vehicle return deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = {
    getAllVehicleReturns,
    getVehicleReturnById,
    createVehicleReturn,
    updateVehicleReturn,
    deleteVehicleReturn
};
