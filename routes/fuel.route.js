const express = require('express');
const { getAllFuelRecords, createFuelRecord } = require('../controllers/fuel.controller');
const router = express.Router();

// Route สำหรับดึงข้อมูลการเติมน้ำมันทั้งหมด
router.get('/', getAllFuelRecords);

// Route สำหรับสร้างบันทึกการเติมน้ำมันใหม่
router.post('/', createFuelRecord);

module.exports = router;
