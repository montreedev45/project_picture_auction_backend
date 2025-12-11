const router = require('express').Router();
const auctionController = require('../controllers/auctionController') 
const authController = require('../controllers/authController')
const { checkTokenStatus } = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware')
const { uploadProfilePic } = require('../middlewares/uploadMiddleware')
// const { updateProfile } = require('../middleware/uploadMiddleware'); // Multer

// ไม่ควรแสดง id ใน route เมื่อเกี่ยวกับตัวเอง เช่น update เพราะ ตอน login jwt ได้รับ id แล้ว
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

// 7. PUT /api/auction/users/profile - อัปเดต โปรไฟล์
router.put('/users/profile', protect, uploadProfilePic, authController.updateProfile);

// 8. PUT /api/auction/profile/password - อัปเดต รหัสผ่าน
router.put('/profile/password', protect, authController.updatePasswordById);

// 9. POST /api/auction/forgot-password - ลืมรหัสผ่าน
router.post('/forgot-password', authController.forgotPassword);

// 10. POST /api/auction/reset-password:token - ลืมรหัสผ่าน
router.post('/reset-password/:token', authController.resetPassword);

router.post('/products/:productId/toggle-like', protect, auctionController.toggleLikeProduct);

router.post('/products/:productId/bids',protect, auctionController.auctionProduct)

router.get('/products/:productId/history',protect, auctionController.auctionHistory)

router.post('/checkToken',protect, checkTokenStatus)

router.post('/coin-packet', protect, auctionController.coinPacket)




module.exports = router;
