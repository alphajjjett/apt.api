const express = require('express');
const { getAllMaintenanceRecords, createMaintenanceRecord } = require('../controllers/maintenance.controller');
const router = express.Router();

// Route สำหรับดึงข้อมูลการบำรุงรักษาทั้งหมด
router.get('/', getAllMaintenanceRecords);

// Route สำหรับสร้างบันทึกการบำรุงรักษาใหม่
router.post('/', createMaintenanceRecord);

module.exports = router;
