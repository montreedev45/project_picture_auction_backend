const router = require('express').Router();
const auctionController = require('../controllers/auctionController')
const authController = require('../controllers/authController')

// --- API Endpoints ---

// 1. GET /api/auction/products - ดึงสินค้าทั้งหมด
router.get('/products', auctionController.getProducts);

// 2. GET /api/auction/product/:id - ดึงสินค้าตาม ID
router.get('/product/:id', auctionController.getProductById);

// 3. GET /api/auction/users - ดึงผู้ใช้ทั้งหมด
router.get('/users', authController.getUsers);

// 4. GET /api/auction/users/:id - ดึงผู้ใช้ตาม ID
router.get('/users/:id', authController.getUserById);

// 5. POST /api/auction/register - สมัครสมาชิก
router.post('/register', authController.register);

// 6. POST /api/auction/login - ล็อกอิน
router.post('/login', authController.login);

module.exports = router;
