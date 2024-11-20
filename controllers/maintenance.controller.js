const Maintenance = require('../models/maintenace.model');


const getAllMaintenanceRecords = async (req, res) => {
    try {
        const maintenanceRecords = await Maintenance.find();
        res.status(200).json(maintenanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};


const createMaintenanceRecord = async (req, res) => {
    const { vehicle_id, 
            description, 
            maintenance_date, 
            next_due } = req.body;

    try {
        const newMaintenanceRecord = new Maintenance({ vehicle_id, description, maintenance_date, next_due });
        await newMaintenanceRecord.save();
        res.status(201).json(newMaintenanceRecord);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

module.exports = { getAllMaintenanceRecords, createMaintenanceRecord };
