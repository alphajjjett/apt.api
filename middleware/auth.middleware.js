const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  // ดึง token จาก header Authorization
  const token = req.headers.authorization?.split(' ')[1]; 

  // ตรวจสอบว่า token มีอยู่ใน header หรือไม่
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    // ตรวจสอบความถูกต้องของ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    
    // ตรวจสอบ role ของผู้ใช้
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, not an admin' });
    }

    // เพิ่มข้อมูล user ลงใน request สำหรับใช้งานใน middleware หรือ controller ถัดไป
    req.user = decoded;
    next(); // ถ้าเป็น Admin ให้ไปยังฟังก์ชันถัดไป

  } catch (error) {
    // หากเกิดข้อผิดพลาดในการตรวจสอบ token
    res.status(400).json({ message: 'Invalid token', error: error.message });
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach the user information to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


module.exports = verifyAdmin,authenticateToken;
