const express = require('express');
const { getAllUsers, 
        registerUser, 
        getUserById, 
        loginUser,
        getCurrentUser,
        updateCurrentUser,
        deleteUser,
        uploadProfilePicture, 
        upload
        } = require('../controllers/user.controller');
const router = express.Router();
const auth = require('../middleware/auth.middleware');


// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/', getAllUsers);

// Route for user registration
router.post('/register', registerUser); // This should match the endpoint you are hitting from the frontend

// Route สำหรับหา ID USer
router.get('/:id', getUserById);

//route login

router.post('/login', loginUser);


router.get('/login', loginUser);

// Route สำหรับดึงข้อมูล user ที่ล็อกอินอยู่
router.get('/me',  getCurrentUser);

// Route สำหรับแก้ไขข้อมูล user ที่ล็อกอินอยู่
router.put('/me', updateCurrentUser);


// Route สำหรับลบผู้ใช้
router.delete('/:id', auth, deleteUser);

// Route สำหรับอัปโหลดไฟล์โปรไฟล์
router.post('/upload-profile-picture', upload, uploadProfilePicture);

module.exports = router;
