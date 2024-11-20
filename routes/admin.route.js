const express = require('express');
const router = express.Router();
const { 
    registerAdmin, 
    loginAdmin, 
    createAdmin, 
    getAllAdmins 
} = require('../controllers/admin.controller');

// สมัครผู้ดูแลระบบ
router.post('/register', registerAdmin);

// เข้าสู่ระบบผู้ดูแลระบบ
router.post('/login', loginAdmin);

// สร้างผู้ดูแลระบบใหม่ (โดยผู้ดูแลระบบที่มีสิทธิ์)
router.post('/create', createAdmin);

// ดึงข้อมูลผู้ดูแลระบบทั้งหมด
router.get('/admins', getAllAdmins);

module.exports = router;
