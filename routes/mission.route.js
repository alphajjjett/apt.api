const express = require('express');
const { getAllMissions, createMission } = require('../controllers/mission.controller');
const router = express.Router();

// Route สำหรับดึงข้อมูลมิสชั่นทั้งหมด
router.get('/', getAllMissions);

// Route สำหรับสร้างมิสชั่นใหม่
router.post('/', createMission);

module.exports = router;
