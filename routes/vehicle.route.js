const express = require("express");
const router = express.Router();
const verifyAdmin = require('../middleware/auth.middleware');
// Import controllers
const {
    getAllVehicles, 
    createVehicle, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle,
    updateVehicleStatus,
    getAllVehicleStatuses

} = require('../controllers/vehicle.controller.js');

// Route สำหรับการดึงข้อมูลรถทั้งหมด
router.get('/', getAllVehicles);

// Route สำหรับดึงข้อมูลรถตาม ID
router.get("/:id", getVehicleById);

// Route สำหรับสร้างข้อมูลรถใหม่
// router.post("/", createVehicle);

router.post('/create', verifyAdmin, createVehicle);

// Route สำหรับอัปเดตข้อมูลรถตาม ID
router.put("/:id", updateVehicle);

// Route สำหรับลบข้อมูลรถตาม ID
router.delete("/:vehicleId", verifyAdmin, deleteVehicle);

// GET all vehicles with their statuses
router.get('/statuses', getAllVehicleStatuses);

// PUT for updating vehicle status
router.put('/statuses/:id', updateVehicleStatus);





module.exports = router;
