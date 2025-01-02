const express = require('express');
const { 
    getAllAdmins, 
    registerAdmin, 
    getAdminById, 
    loginAdmin, 
    updateAdmin, 
    deleteAdmin 
} = require('../controllers/admin.controller'); 
const router = express.Router();
const auth = require('../middleware/auth.middleware');


router.post('/login', loginAdmin);

router.post('/register', registerAdmin); 

// Route to get all users (admin only)
router.get('/', auth, getAllAdmins);  // Only admin can get all users

router.get('/:id', auth, getAdminById);

router.put('/:id',updateAdmin); 

router.delete('/:id', auth, deleteAdmin); 

module.exports = router;
