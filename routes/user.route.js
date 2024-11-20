const express = require('express');
const { getAllUsers, createUser, getUserById } = require('../controllers/user.controller');
const router = express.Router();
const auth = require('../middleware/auth');

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/', getAllUsers);

// Route สำหรับสร้างผู้ใช้ใหม่
router.post('/', createUser);

// Route สำหรับหา ID USer
router.get('/:id',getUserById);

module.exports = router;
