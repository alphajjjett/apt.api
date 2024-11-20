const Fuel = require('../models/fuel.model');


const getAllFuelRecords = async (req, res) => {
    try {
        const fuelRecords = await Fuel.find();
        res.status(200).json(fuelRecords);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};


const createFuelRecord = async (req, res) => {
    const { vehicle_id, 
            fuel_type, 
            amount } = req.body;

    try {
        const newFuelRecord = new Fuel({ vehicle_id, fuel_type, amount });
        await newFuelRecord.save();
        res.status(201).json(newFuelRecord);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = { getAllFuelRecords, 
                    createFuelRecord 
                };
