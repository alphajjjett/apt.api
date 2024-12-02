const express = require('express');
const router = express.Router();
const { getAllMissions, createMission, updateMissionStatus, deleteMission } = require('../controllers/mission.controller');
const verifyAdmin = require('../middleware/auth.middleware');

// ดึงข้อมูลภารกิจทั้งหมด
router.get('/', getAllMissions);

// เพิ่มภารกิจใหม่
router.post('/', createMission);

router.post('/', verifyAdmin, createMission);

// Route to update mission status
router.put('/:missionId/status', updateMissionStatus);

// Route สำหรับลบภารกิจ
router.delete('/:missionId', verifyAdmin, deleteMission);
module.exports = router;
