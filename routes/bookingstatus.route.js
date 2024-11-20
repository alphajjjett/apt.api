const express = require('express');
const { getAllBookingStatuses, createBookingStatus } = require('../controllers/bookingstatus.controller');
const router = express.Router();

// Route สำหรับดึงข้อมูลสถานะการจองทั้งหมด
router.get('/', getAllBookingStatuses);

// Route สำหรับสร้างสถานะการจองใหม่
router.post('/', createBookingStatus);

module.exports = router;
