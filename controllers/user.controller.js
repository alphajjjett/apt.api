const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ค้นหาผู้ใช้ในฐานข้อมูลตาม email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // ตรวจสอบรหัสผ่านที่ผู้ใช้ป้อนกับรหัสผ่านในฐานข้อมูล
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // สร้าง JWT token พร้อมข้อมูล id และ role
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email, name : user.name }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // ส่ง token กลับไปยัง client
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Register User สมัครเข้าระบบ
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    // Use the user's role from the database
    const token = jwt.sign({ id: newUser._id,name : newUser.name ,email : newUser.email , role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // แก้ล่าสุด

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user', error });
  }
};








// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};




// Get user by id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(' ')[1]; // ดึง token จาก header
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ตรวจสอบว่า id ของผู้ใช้ที่ร้องขอเหมือนกับ id ที่ได้รับจาก token หรือไม่
    if (decoded.userId !== id) {
      return res.status(403).json({ message: 'You are not authorized to access this data.' });
    }

    // ดึงข้อมูลจาก database (สมมุติใช้ MongoDB)
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
};

// Update current user info
const updateCurrentUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// ฟังก์ชันลบผู้ใช้
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ตรวจสอบว่า user ที่จะลบเป็นคนที่ล็อกอินอยู่หรือไม่ หรือเป็น admin ที่ลบ
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this user' });
    }

    // ลบผู้ใช้
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
  updateCurrentUser,
  getCurrentUser,
  deleteUser
};
