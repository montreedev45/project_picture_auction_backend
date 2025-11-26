const auctionService = require("../services/auctionService");
const { broadcastNewBid } = require("../socketManager"); // ⬅️ ต้องแก้ไข Path นี้ให้ถูกต้อง

exports.getProducts = async (req, res, next) => {
  try {
    const products = await auctionService.getProducts();
    return res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    return next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const ProductId = req.params.id;
    const product = await auctionService.getProductById(ProductId);
    return res
      .status(200)
      .json({ message: "Product By Id fetched successfully", product });
  } catch (error) {
    return next(error);
  }
};

exports.toggleLikeProduct = async (req, res, next) => {
  // 1. 🔑 FIX: ดึง Parameter จาก req.params
  const userId = req.user.id;
  const productsId = parseInt(req.params.productId); // ✅ แก้ไขตรงนี้
  try {
    const result = await auctionService.toggleLike(productsId, userId);

    if (result.action === "liked") {
      // ✅ FIX: ส่ง 200 OK พร้อม JSON Body
      return res.status(200).json({
        message: "Product liked successfully",
        likeCount: result.likeCount,
      });
    } else {
      return res.status(200).json({
        message: "Product unliked successfully", // 💡 แก้ไข spelling
        likeCount: result.likeCount, // 💡 แก้ไขชื่อ field
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.auctionProduct = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId, 10);

    const { bidPrice } = req.body;
    if (!bidPrice || typeof bidPrice !== "number" || bidPrice <= 0) {
      // ส่ง Error 400 (Bad Request) ถ้าข้อมูลไม่ถูกต้อง
      return res.status(400).json({ message: "Invalid bid price provided" });
    }

    const result = await auctionService.auctionProduct(
      userId,
      productId,
      bidPrice,
      broadcastNewBid
    );
    const product = result.updatedProduct;
    const history = result.history;

    return res.status(200).json({
      message: "Bid placed successfully",
      product: product, // ส่งข้อมูล product ที่อัปเดต และ bid ใหม่ กลับไป
      history: history,
    });
  } catch (error) {
    console.log(error)
    return next(error);
  }
};

exports.auctionHistory = async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    const historyData = await auctionService.auctionHistory(userId, productId);

    res.status(200).json({
      message: "fecth history successfully",
      history: historyData,
    });
  } catch (error) {
    return next(error);
  }
};

exports.checkToken = async (req, res, next) => {
  // ใน Backend (Controller/Middleware)

  // 1. รับ Token จาก Header 'Authorization'
  const token = req.headers.authorization.split(" ")[1]; // แยก 'Bearer' ออก

  // 2. ใช้ Middleware สำหรับ verify Token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // 🚨 ถ้ามี Error (เช่น TokenExpiredError หรือ Invalid Signature)
      return res.status(401).json({ message: "Token is invalid or expired." });
    }

    // ✅ ถ้า Verify ผ่าน:
    res.status(200).json({ message: "Token is valid." });
  });
};
