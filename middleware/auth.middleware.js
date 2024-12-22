// authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // ดึง token จาก header
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    // ตรวจสอบและถอดรหัส token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // เพิ่มข้อมูลผู้ใช้ใน req.user สำหรับการใช้ใน controller
    req.user = decoded;
    
    // ตรวจสอบว่า user ต้องการเข้าถึงข้อมูลของตัวเองหรือไม่
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, user can only update their own data' });
    }

    next(); // ให้ไปยัง controller ถัดไป

  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = authMiddleware;
