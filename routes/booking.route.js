const express = require('express');
const { getAllBookings, createBooking } = require('../controllers/booking.controller');
const router = express.Router();

// Route สำหรับดึงข้อมูลการจองทั้งหมด
router.get('/', getAllBookings);

// Route สำหรับสร้างการจองใหม่
router.post('/', createBooking);

module.exports = router;
