const router = require('express').Router();
const auctionController = require('../controllers/auctionController')

// --- API Endpoints ---

// 1. GET /api/auction/products - ดึงสินค้าทั้งหมด
router.get('/products', auctionController.getProducts);

// 2. GET /api/auction/product/:id - ดึงสินค้าตาม ID
router.get('/product/:id', auctionController.getProductById);

// 3. GET /api/auction/users - ดึงผู้ใช้ทั้งหมด
router.get('/users', auctionController.getUsers);

// 4. GET /api/auction/users/:id - ดึงผู้ใช้ตาม ID
router.get('/users/:id', auctionController.getUserById);



module.exports = router;
