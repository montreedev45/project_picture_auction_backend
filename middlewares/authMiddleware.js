const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.protect = (req, res, next) => {
    let token;

    // ตรวจสอบ Header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // รูปแบบ: Bearer [TOKEN]
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    try {
        // ยืนยัน Token
        const decoded = jwt.verify(token, JWT_SECRET);

        // เก็บ Payload ของผู้ใช้ไว้ใน req object
        req.user = decoded; 
        
        // 4. next คือไปยัง Controller
        next();
    } catch (err) {
        // Token ไม่ถูกต้อง/หมดอายุ
        return res.status(401).json({ message: 'Token is not valid or expired.' });
    }
};