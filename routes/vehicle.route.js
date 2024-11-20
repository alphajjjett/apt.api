const express = require("express");
const router = express.Router();
// Import controllers
const {
    getAllVehicles, 
    createVehicle, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle,


} = require('../controllers/vehicle.controller.js');

// Route สำหรับการดึงข้อมูลรถทั้งหมด
router.get('/', getAllVehicles);

// Route สำหรับดึงข้อมูลรถตาม ID
router.get("/:id", getVehicleById);

// Route สำหรับสร้างข้อมูลรถใหม่
router.post("/", createVehicle);

// Route สำหรับอัปเดตข้อมูลรถตาม ID
router.put("/:id", updateVehicle);

// Route สำหรับลบข้อมูลรถตาม ID
router.delete("/:id", deleteVehicle);






module.exports = router;
