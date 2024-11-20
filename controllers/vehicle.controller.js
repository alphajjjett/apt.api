const Vehicle = require("../models/vehicle.model.js"); // Import Vehicle model


// Controller สำหรับการดึงข้อมูลรถทั้งหมด
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find(); // ดึงข้อมูลรถทั้งหมด
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Controller สำหรับการสร้างข้อมูลรถใหม่
const createVehicle = async (req, res) => {
    try {
        const newVehicle = new Vehicle(req.body); // สร้าง object ของรถจากข้อมูลที่ส่งมา
        await newVehicle.save(); // บันทึกลงฐานข้อมูล
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Controller สำหรับการดึงข้อมูลรถตาม ID
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Controller สำหรับการอัปเดตข้อมูลรถ
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, { new: true }); // อัปเดตข้อมูลรถ
        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Controller สำหรับการลบข้อมูลรถ
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVehicle = await Vehicle.findByIdAndDelete(id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


module.exports = {
    getAllVehicles,
    createVehicle,
    getVehicleById,
    updateVehicle,
    deleteVehicle
};
