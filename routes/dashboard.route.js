const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard.controller');  // นำเข้า controller

// กำหนด route สำหรับ dashboard
router.get('/dashboard', getDashboardData);

module.exports = router;
