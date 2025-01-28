const express = require('express');
const router = express.Router();
const { getAllMissions, createMission, updateMissionStatus, deleteMission, updateMission } = require('../controllers/mission.controller');
const verifyAdmin = require('../middleware/auth.middleware');


// ดึงข้อมูลภารกิจทั้งหมด
router.get('/', getAllMissions);

// เพิ่มภารกิจใหม่
router.post('/', createMission);

router.post('/', verifyAdmin, createMission);

// Route to update mission status
router.put('/:missionId/status', updateMissionStatus);

router.put('/:missionId', updateMission);

// Route สำหรับลบภารกิจ
router.delete('/:missionId', deleteMission);


module.exports = router;
