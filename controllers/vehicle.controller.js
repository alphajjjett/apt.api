const { json } = require('express');
const Vehicle = require('../models/vehicle.model');

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json(vehicles);
    }catch (error){
        res.status(500).json({message : error.message });
    }
}

const createVehicle = async (req, res) => {
    const {license_plate, model, fuel_type, status} = req.body;

    try {
        const newVehicle = new Vehicle ({license_plate, model, fuel_type, status});
        await newVehicle.save();
        res.status(201).json(newVehicle);
    }catch (error){
        res.status(500).json({message : error.message});
    }
}

module.exports = {
    getAllVehicles,
    createVehicle

}