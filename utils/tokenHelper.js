const jwt = require('jsonwebtoken');
require('dotenv').config(); // 💡 ต้องโหลด .env ในไฟล์ที่ใช้

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

exports.generateAuthToken = (userPayload) => {
    // 🔑 Tech Stack: jwt.sign(payload, secret, options)
    const token = jwt.sign(
        // 1. Payload: เก็บเฉพาะข้อมูลที่จำเป็นและไม่ละเอียดอ่อน
        { 
            id: userPayload.acc_id, // 💡 ใช้ Custom ID ของคุณ
            username: userPayload.acc_username,
            email: userPayload.acc_email
        }, 
        // 2. Secret: กุญแจลับที่ใช้ Sign
        JWT_SECRET,
        // 3. Options: กำหนดวันหมดอายุ
        { expiresIn: JWT_EXPIRES_IN } 
    );
    return token;
};