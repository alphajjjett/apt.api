const express = require('express');
const { registerAdmin, loginAdmin, getAdmins } = require('../controllers/admin.controller');
const router = express.Router();

// Register route
router.post('/register', registerAdmin);

// Login route
router.post('/login', loginAdmin);


module.exports = router;
