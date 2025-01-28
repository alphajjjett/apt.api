const express = require('express');
const { loginAdmin, registerAdmin } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', loginAdmin);       // สำหรับ login
router.post('/register', registerAdmin); // สำหรับ register

module.exports = router;
