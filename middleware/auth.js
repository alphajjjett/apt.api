const jwt = require('jsonwebtoken');

// Middleware สำหรับตรวจสอบ JWT token
const auth = (req, res, next) => {
    // รับ token จาก header ที่ชื่อ Authorization
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // ตรวจสอบและถอดรหัส token โดยใช้ JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // เก็บข้อมูลผู้ใช้ใน req.user
        next(); // ดำเนินการถัดไป
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
