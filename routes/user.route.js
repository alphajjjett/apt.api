const express = require('express');
const { getAllUsers, registerUser, getUserById, loginUser } = require('../controllers/user.controller');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/', getAllUsers);

// Route for user registration
router.post('/register', registerUser); // This should match the endpoint you are hitting from the frontend

// Route สำหรับหา ID USer
router.get('/:id',getUserById);

//route login

router.post('/login', loginUser);


router.get('/login', loginUser);

module.exports = router;
