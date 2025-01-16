const Maintenance = require('../models/maintenance.model');

// Create new maintenance record
const createMaintenance = async (req, res) => {
    try {
        const { vehicleId, description } = req.body;

        const newMaintenance = new Maintenance({
            vehicleId,
            description,
        });

        await newMaintenance.save();
        res.status(201).json(newMaintenance);
    } catch (error) {
        res.status(500).json({ message: 'Error creating maintenance record', error });
    }
};

// Get all maintenance records
const getAllMaintenance = async (req, res) => {
    try {
        const maintenanceRecords = await Maintenance.find().populate('vehicleId');
        res.status(200).json(maintenanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance records', error });
    }
};

// Get maintenance record by ID
const getMaintenanceById = async (req, res) => {
    try {
        const maintenanceRecord = await Maintenance.findById(req.params.id).populate('vehicleId user');
        if (!maintenanceRecord) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.status(200).json(maintenanceRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance record', error });
    }
};

// Update maintenance record
const updateMaintenance = async (req, res) => {
    try {
        const { description } = req.body;
        const maintenanceRecord = await Maintenance.findById(req.params.id);
        
        if (!maintenanceRecord) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        maintenanceRecord.description = description || maintenanceRecord.description;

        await maintenanceRecord.save();
        res.status(200).json(maintenanceRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error updating maintenance record', error });
    }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
    try {
        const maintenanceRecord = await Maintenance.findById(req.params.id);

        if (!maintenanceRecord) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        await maintenanceRecord.remove();
        res.status(200).json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting maintenance record', error });
    }
};

module.exports = {
    createMaintenance,
    getAllMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance,
};
