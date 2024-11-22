const express = require('express');
const router = express.Router();
const { getAllMissions, createMission } = require('../controllers/mission.controller');

// ดึงข้อมูลภารกิจทั้งหมด
router.get('/', getAllMissions);

// เพิ่มภารกิจใหม่
router.post('/', createMission);

module.exports = router;
