const Product = require("../models/Product");
const Bid = require("../models/Bid");

exports.getProducts = async () => {
  return await Product.find();
};

exports.getProductById = async (ProductId) => {
  const queryId = Number(ProductId);

  const product = await Product.findOne({ pro_id: queryId });

  if (!product) {
    // 💡 Best Practice: โยน Error ที่มี Status Code 404
    const error = new Error(`Product with ID ${ProductId} not found.`);
    error.statusCode = 404; // HTTP Not Found
    throw error;
  }

  return product;
};

exports.toggleLike = async (productId, userId) => {
  // 1. ค้นหาเพื่อตรวจสอบการมีอยู่และสถานะ Like ปัจจุบัน
  const product = await Product.findOne({ pro_id: productId }).select("likes");

  if (!product) {
    throw new Error("Products not found");
  }

  const hasLiked = product.likes.includes(userId);
  let updateOperation;
  let action; // 💡 ตัวแปร action ถูกประกาศแล้ว

  if (hasLiked) {
    // 2. 🔑 Logic: UNLIKE (ดึงออกและลดจำนวน)
    updateOperation = {
      $pull: { likes: userId },
      $inc: { pro_likecount: -1 },
    };
    action = "unliked"; // ✅ แก้ไข Syntax
  } else {
    // 3. 🔑 Logic: LIKE (เพิ่มเข้าและเพิ่มจำนวน)
    updateOperation = {
      $addToSet: { likes: userId },
      $inc: { pro_likecount: 1 }, // ✅ แก้ไข: ต้องเป็น +1
    };
    action = "liked"; // ✅ แก้ไข Syntax
  }

  // 4. Mongoose: ทำการอัปเดต Atomic
  // ✅ FIX: ใช้ updateOperation เป็น Argument ตัวที่ 2
  const updatedProducts = await Product.findOneAndUpdate(
    { pro_id: productId }, // 💡 ใช้ Object query เพื่อความชัดเจน
    updateOperation,
    { new: true } // คืนค่า Document ที่อัปเดตแล้ว
  );

  console.log("action : ", action);
  console.log("pro_likecount : ", updatedProducts.pro_likecount);
  console.log("pro_id : ", updatedProducts.pro_id);
  // 5. คืนค่ากลับไปยัง Controller
  return {
    action: action,
    likeCount: updatedProducts.pro_likecount,
  };
};

exports.auctionProduct = async (
  userId,
  productId,
  bidPrice,
  broadcastNewBid
) => {
  // 1. 🔍 ค้นหาสินค้า (ใช้ let เพื่อให้เราอัปเดตค่าได้)
  let product = await Product.findOne({ pro_id: productId });

  if (!product) {
    throw new Error("Product not found");
  }

  const currentPrice = product.pro_price;
  const minIncrement = product.pro_min_increment || 100; // 🚨 กำหนดค่า Default 100

  // ----------------------------------------------------
  // 2. 🛡️ Business Logic: การตรวจสอบราคาขั้นต่ำ
  // ----------------------------------------------------
  const requiredMinimumBid = currentPrice + minIncrement;

  if (bidPrice < requiredMinimumBid) {
    // 🚨 CRITICAL: ถ้าไม่ผ่านเงื่อนไข ให้ Throw Error
    // พร้อมข้อความที่ชัดเจน
    throw new Error(
      `Bid amount must be at least $${requiredMinimumBid} (Current Price + Minimum Increment).`
    );
  }
  // 3. 🏁 ตรรกะ "Bid แรก" (ถ้า endTimeAuction ยังไม่มี)
  if (!product.endTimeAuction) {
    console.log("First bid! Starting auction timer...");

    const startTimeAuction = Date.now();
    const endTimeAuction = startTimeAuction + product.pro_time * 1000;

    // ใช้ { new: true } เพื่อรับเอกสารที่อัปเดตแล้วกลับมา
    const updatedProduct = await Product.findOneAndUpdate(
      { pro_id: productId }, // Query
      {
        startTimeAuction: startTimeAuction,
        endTimeAuction: endTimeAuction,
      },
      { new: true } // Option: ขอข้อมูลใหม่กลับมา
    );

    // อัปเดตตัวแปร 'product' ให้เป็นข้อมูลใหม่ที่มี 'endTimeAuction' แล้ว
    product = updatedProduct;
  }

  // 4. ⏰ (ปรับปรุง) ตรวจสอบเวลา (ตอนนี้ 'product.endTimeAuction' มีค่าแน่นอนแล้ว)
  if (Date.now() > product.endTimeAuction) {
    // 🛡️ (ปรับปรุง) ใช้ throw Error แทนการ return string
    const error = new Error("Auction has ended.");
    error.statusCode = 400; // ⬅️ กำหนด 400 Bad Request
    throw error;
  }

  // 5. 💰 ตรวจสอบราคา
  if (bidPrice <= product.pro_price) {
    // 🛡️ (ปรับปรุง) ใช้ throw Error
    throw new Error("Bid price must be higher than the current price");
  }

  // --- ถ้าผ่านทุกอย่าง ---

  // 6. 📝 บันทึกประวัติการประมูล (Bid History)
  // ❗️ (แก้ไข Syntax) ส่งค่าเป็น Object เดียว
  const newBid = new Bid({
    pro_id: productId, // (ผมอ้างอิงจากโค้ดเดิมของคุณ)
    acc_id: userId, // (ผมอ้างอิงจากโค้ดเดิมของคุณ)
    bidAmount: bidPrice,
  });
  await newBid.save();

  // 7. 🔄 อัปเดตสถานะสินค้า (ราคาปัจจุบัน และ ผู้ประมูลล่าสุด)
  // ❗️ (แก้ไข Syntax) แยก Query และ Update Object
  const finalProductUpdate = await Product.findOneAndUpdate(
    { pro_id: productId }, // Query
    {
      pro_price: bidPrice,
      pro_accby: userId, // (ไม่ต้องใช้ `${userId}` ถ้า userId เป็น string อยู่แล้ว)
    },
    { new: true } // ขอข้อมูลใหม่
  );

  const history = await Bid.find({ pro_id: productId }).sort({ createdAt: -1 });
  console.log("Debug Service: Ready to Broadcast to:", productId); // 💡 เพิ่ม Log
  console.log("Debug Service: New Price:", finalProductUpdate.pro_price); // 💡 เพิ่ม Log

  broadcastNewBid(productId, finalProductUpdate, history);

  // 8. ✅ ส่งข้อมูลกลับไปที่ Controller
  return {
    updatedProduct: finalProductUpdate,
    history: history,
  };
};

exports.auctionHistory = async (userId, productId) => {
  return await Bid.find({ pro_id: productId }).sort({ createdAt: -1 });
};
