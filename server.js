const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const auctionRoutes = require('./routes/auctionRoutes');

// Config: โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;


// --- Middlewares ---
// 1. CORS Configuration: อนุญาตให้ Frontend เข้าถึงได้
const allowedOrigin = process.env.CLIENT_URL;
const corsOptions = {
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // อนุญาตให้ส่ง Cookies/Auth Headers
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// 2. ทำให้ Express สามารถอ่าน JSON จาก Request Body ได้
app.use(express.json());


// --- Routes ---
// ตั้งค่า Base URL สำหรับ API 
app.use('/api/auction', auctionRoutes);

// Test Route: API สำหรับตรวจสอบสถานะ Server
app.get('/', (req, res) => {
    res.send(`Auction API is running successfully on port ${PORT}!`);
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});