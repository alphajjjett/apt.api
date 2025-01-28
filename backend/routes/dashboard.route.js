const express = require('express');
const router = express.Router();
const { getVehicleStatusStats } = require('../controllers/dashboard.controller');  // นำเข้า controller


// กำหนด route สำหรับ dashboard
router.get('/dashboard', getVehicleStatusStats);


module.exports = router;
