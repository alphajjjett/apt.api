const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
   
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

   
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

     
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email, name: user.name, description: user.description }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

     
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, description } = req.body; 

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, description }); 

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, description: newUser.description }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};


const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.headers.authorization.split(' ')[1]; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        if (decoded.id !== id) {
            return res.status(403).json({ message: 'You are not authorized to access this data.' });
        }

        
        const user = await User.findById(id, '-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, '-password'); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
};


const updateUser = async (req, res) => {
    const { id } = req.params;  // ดึง id ของผู้ใช้จาก URL
    const { name, email, description } = req.body;  // ดึงข้อมูลที่ต้องการอัปเดตจาก body ของ request
  
    try {
      // ค้นหาผู้ใช้จาก MongoDB ตาม id
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });  // ถ้าหาผู้ใช้ไม่เจอ ให้ตอบกลับ 404
      }
  
      // อัปเดตข้อมูลของผู้ใช้
      user.name = name || user.name;  // ถ้ามีการส่ง name มาให้แก้ไข ถ้าไม่ส่งก็ใช้ค่าเดิม
      user.email = email || user.email;  // ถ้ามีการส่ง email มาให้แก้ไข ถ้าไม่ส่งก็ใช้ค่าเดิม
      user.description = description || user.description;  // ถ้ามีการส่ง description มาให้แก้ไข ถ้าไม่ส่งก็ใช้ค่าเดิม
  
      // บันทึกการอัปเดตข้อมูลในฐานข้อมูล
      const updatedUser = await user.save();
  
      // ส่งข้อมูลผู้ใช้ที่อัปเดตกลับไป
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });  // ถ้ามีข้อผิดพลาดใน server
    }
  };
  
  


const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete this user' });
        }
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    loginUser,
    registerUser,
    updateUser,
    getCurrentUser,
    deleteUser
};
