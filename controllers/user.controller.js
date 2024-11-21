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
      const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // ส่ง token กลับไปยัง client
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };
  
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // ตรวจสอบว่ามี user ที่มี email นี้หรือไม่
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // เข้ารหัสรหัสผ่าน
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // สร้าง user ใหม่
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
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


const getUserById = async (req, res) =>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        if(!user) {
            return res.status(404).json({message : "User not found !"});
        }
        res.status(200).json(user);
    }catch (error){
        res.status(500).json({meaage : error.message});
    }
};


module.exports = { getAllUsers, 
                    getUserById,
                    loginUser,
                    registerUser
                };
