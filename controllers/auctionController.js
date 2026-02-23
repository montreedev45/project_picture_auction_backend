const auctionService = require("../services/auctionService");
const { broadcastNewBid } = require("../socketManager"); // ⬅️ ต้องแก้ไข Path นี้ให้ถูกต้อง

exports.getProducts = async (req, res, next) => {
//console.log(`[${new Date().toLocaleTimeString()}] incoming request: ${req.method} ${req.url}`);
  try {
    const { acc_id, is_time_sensitive, page ,userId, dropdownMonth} = req.query || {};
    let queryCriteria = {};
    // 1. 🎯 แก้ไข: ดึงเฉพาะ key 'category' ออกจาก req.query
    // 🔑 ถ้าไม่ส่งมา category จะเป็น undefined
    const { "status[]": pro_status, pro_name_input: pro_name } = req.query;

    if (is_time_sensitive === "true") {
      const currentTime = Date.now();

      queryCriteria.endTimeAuction = { $lte: currentTime };
    }

    // 💡 หากต้องการดู Query Parameters ทั้งหมด
    // console.log("pro_name_input", pro_name);
    // console.log("All Query Params:", req.query);
    // console.log("Category Query Value:", pro_status); // ค่าที่ส่งมาสำหรับ category

    // 2. 🔧 จัดการค่า: ทำให้เป็น Array ของ Category เสมอ
    // เช่น: undefined => [], 'Electronics' => ['Electronics'], ['E', 'B'] => ['E', 'B']
    const pro_statusArray = pro_status
      ? Array.isArray(pro_status)
        ? pro_status
        : [pro_status]
      : [];

    // 3. 🔑 เช็คความยาวของ Array ก่อนสร้าง Criteria
    if (pro_statusArray.length > 0) {
      // 🎯 สร้าง MongoDB Query Criteria โดยใช้ $in
      queryCriteria.pro_status = { $in: pro_statusArray };
    }

    const Trim_pro_name = pro_name ? String(pro_name).trim() : "";
    if (Trim_pro_name.length > 0) {
      // 🔑 สร้าง Regular Expression
      // '^' : หมายถึง ต้องขึ้นต้นด้วยคำนี้ (Prefix Search)
      // 'i' : หมายถึง ไม่คำนึงถึงตัวพิมพ์เล็ก/ใหญ่ (Case Insensitive)
      const searchRegex = new RegExp("^" + Trim_pro_name, "i");

      // Criteria B: pro_name ต้องขึ้นต้นด้วยคำค้นหา
      // MongoDB จะใช้ Regex Index (ถ้ามี) หรือทำ Table Scan (ถ้าไม่มี)
      queryCriteria.pro_name = searchRegex;
    }

    //console.log("$text", queryCriteria);

    // 4. แสดงผล Criteria ที่จะใช้ค้นหา
    //console.log("Final Query Criteria:", queryCriteria);

    // 5. เรียก Service และส่ง Criteria ที่ถูกต้อง
    const { products = [], dashboardPiechart = [], dashboardBarchart = [] } = await auctionService.getProducts(
      queryCriteria,
      acc_id,
      page,
      userId,
      dropdownMonth
    );

    return res
      .status(200)
      .json({ message: "Products fetched successfully", products: products, dashboardPiechart: dashboardPiechart, dashboardBarchart: dashboardBarchart });
  } catch (error) {
    // 🚨 การจัดการ Error ที่ดี
    console.error("Error in getProducts controller:", error);
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
    console.log(error);
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

exports.coinPacket = async (req, res, next) => {
  const { coinPacket } = req.body;
  console.log(coinPacket);
  const userId = req.user.id;

  try {
    const result = await auctionService.coinPacket(userId, +coinPacket);
    return res.status(200).json({ message: "Top up coin successfully" });
  } catch (error) {
    return next(error);
  }
};
