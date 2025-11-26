// uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Tech Stack: สำหรับจัดการไฟล์ (เช่น ลบไฟล์เก่า)

// 1. กำหนดโฟลเดอร์ปลายทาง
const destinationFolder = path.join(__dirname, '../uploads/profiles');

// 2. ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // บันทึกในโฟลเดอร์ uploads/profiles/
        cb(null, destinationFolder); 
    },
    filename: (req, file, cb) => {
        console.log(file)
        // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน (เช่น userId_timestamp.jpg)
        const userId = req.user.id; // 💡 ดึง ID จาก req.user ที่ได้จาก Middleware protect
        const fileExtension = path.extname(file.originalname);
        cb(null, `${userId}-${Date.now()}${fileExtension}`); 
    }
});

// 🔑 Middleware: .single('profile_pic') ต้องตรงกับชื่อ field ใน formData.append() ของ Frontend
exports.uploadProfilePic = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // จำกัดขนาดไฟล์ไม่เกิน 2MB
}).single('profile_pic');