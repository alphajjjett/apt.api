const express = require('express');
const { registerAdmin, loginAdmin,createAdmin,getAllAdmins } = require('../controllers/admin.controller');
const router = express.Router();
const auth = require('../middleware/auth');

// Register route
router.post('/register', registerAdmin);

// Login route
router.post('/login', loginAdmin);

// Create admin route (manually by another admin)
router.post('/admins', createAdmin);

// Get all admins
router.get('/admins', auth, getAllAdmins);  // ใช้ auth middleware


module.exports = router;
