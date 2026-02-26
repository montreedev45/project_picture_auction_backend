const Product = require("../models/Product");
const Bid = require("../models/Bid");
const User = require("../models/User");
const { prepareDashboardData } = require("../formatDate");
const { default: mongoose } = require("mongoose");

exports.getProducts = async (
  allQueryParameters = {},
  accId = "",
  page = "",
  userId = 0,
  dropdownMonth = "January",
) => {
  //console.log("allQueryParameters", allQueryParameters)
  let queryConditions = { ...allQueryParameters };
  let bidHis = null;
  let dataDashboard = [
    { id: 1, key: "myBid", name: "My Bid", value: 0 },
    { id: 2, key: "myWinning", name: "My Wining", value: 0 },
    { id: 3, key: "saveItem", name: "Save Item", value: 0 },
  ];

  if (accId) {
    queryConditions.pro_accby = String(accId);

    const result = await Product.find(queryConditions).exec();
    return { products: result };
  }

  if (page === "mybid" && userId > 0) {
    bidHis = await Bid.distinct("pro_id", { acc_id: userId });
    queryConditions.pro_id = { $in: bidHis };
  }

  if (page === "dashboard" && userId > 0) {
    const dataProducts = await Product.find().select({
      updatedAt: 1,
      pro_price: 1,
      _id: 0,
    });
    const result = prepareDashboardData(dataProducts);
    const finalData = result.map((item) => {
      return {
        // แทนที่ updatedAt ด้วยข้อมูล month และ week
        month: item.month,
        week: item.week,
        price: item.price,
      };
    });
    console.log(dropdownMonth);
    const filterFinalData = finalData.filter(
      (item) => item.month == dropdownMonth,
    );
    console.log("filterFinalData", filterFinalData);

    //myBid
    bidHis = await Bid.distinct("pro_id", { acc_id: userId });
    dataDashboard[0].value = bidHis.length;

    //myWinning
    const winning = await Product.find({
      pro_accby: userId,
      pro_status: "ended",
    });
    dataDashboard[1].value = winning.length;

    //saveItem
    dataDashboard[2].value = await Product.countDocuments({ likes: userId });

    //console.log(dataDashboard)
    return {
      dashboardPiechart: dataDashboard,
      dashboardBarchart: filterFinalData,
    };
  }
  const result = await Product.find(queryConditions).exec();
  return { products: result };
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
    { new: true }, // คืนค่า Document ที่อัปเดตแล้ว
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
  broadcastNewBid,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. ดึงข้อมูลภายใน Session เพื่อป้องกัน Race Condition
    //ใช้ .session(session) สำคัญมากในระบบประมูล
    let product = await Product.findOne({ pro_id: productId }).session(session);
    console.log("pro_accBy", product.pro_accby);
    let user = await User.findOne({ acc_id: userId }).session(session);
    let status = "rebid";

    if (!product.endTimeAuction) status = "start";

    if (!user) throw new Error("User not found");
    if (!product) throw new Error("Product not found");

    const previousBidder = product.pro_accby;
    const previousPrice = product.pro_price || 0;
    const minIncrement = product.pro_min_increment || 100;
    const requiredMinimumBid = product.pro_price + minIncrement;

    // 2. Validation Logic
    if (user.acc_coin < bidPrice) {
      throw new Error("Your coins are insufficient, please top up.");
    }

    if (bidPrice < requiredMinimumBid) {
      throw new Error(`Bid amount must be at least $${requiredMinimumBid}`);
    }

    // 3. logic การคืนเงิน (Refund Previous Bidder)
    if (previousBidder && previousBidder !== userId) {
      const refundUpdate = await User.findOneAndUpdate(
        { acc_id: previousBidder },
        { $inc: { acc_coin: previousPrice } },
        { session, new: true },
      );
      if (!refundUpdate)
        console.error("Refund failed for user:", previousBidder);
    }

    // 4. เริ่มตั้งเวลาประมูล (ถ้ายังไม่มี)
    if (!product.endTimeAuction) {
      const startTimeAuction = Date.now();
      const endTimeAuction = startTimeAuction + product.pro_time * 1000;

      product = await Product.findOneAndUpdate(
        { pro_id: productId },
        {
          startTimeAuction,
          endTimeAuction,
          pro_status: "processing",
        },
        { session, new: true },
      );
    }

    // 5. ตรวจสอบเวลา (เช็คหลังจากอัปเดตข้อมูลล่าสุด)
    if (product.endTimeAuction && Date.now() > product.endTimeAuction) {
      const error = new Error("Auction has ended.");
      error.statusCode = 400;
      throw error;
    }

    // 6. หักเงินผู้ประมูลใหม่
    const updatedUser = await User.findOneAndUpdate(
      { acc_id: userId, acc_coin: { $gte: bidPrice } },
      { $inc: { acc_coin: -bidPrice } },
      { session, new: true },
    );

    if (!updatedUser)
      throw new Error("Coin insufficient or user not found during update.");

    // 7. บันทึกประวัติและอัปเดตสินค้า
    const newBid = new Bid({
      pro_id: productId,
      acc_id: userId,
      bidAmount: bidPrice,
    });
    await newBid.save({ session });

    const finalProductUpdate = await Product.findOneAndUpdate(
      { pro_id: productId },
      { pro_price: bidPrice, pro_accby: userId },
      { session, new: true },
    );

    // ยืนยันธุรกรรมทั้งหมด
    await session.commitTransaction();

    // ดึงประวัติและ Broadcast (ทำนอก Transaction เพื่อความเร็ว)
    const history = await Bid.find({ pro_id: productId }).sort({
      createdAt: -1,
    });



    const notification = [
      {
        notic_id: Math.random().toString(36).substring(2, 9),
        acc_id: user.acc_id,
        pro_id: product.pro_id,
        status: status,
      },
    ];
    //console.log(notification)

    broadcastNewBid(productId, finalProductUpdate, history, notification);

    return {
      updatedProduct: finalProductUpdate,
      history: history,
    };
  } catch (error) {
    // หากพลาดตรงไหน ให้ยกเลิกทุกอย่าง (Rollback)
    await session.abortTransaction();
    console.error("Auction Transaction Aborted:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
};

exports.auctionHistory = async (userId, productId) => {
  return await Bid.find({ pro_id: productId }).sort({ createdAt: -1 });
};

exports.checkAndEndAuctions = async (broadcastWinner) => {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    // 1. อัปเดตสินค้าที่หมดเวลาแล้วให้เป็นสถานะ "ended"
    const criteria = {
      pro_status: "processing",
      endTimeAuction: { $lte: now },
    };

    const result = await Product.updateMany(criteria, {
      $set: { pro_status: "ended" },
    });

    if (result.modifiedCount > 0) {
      console.log(`[Scheduler] Ended ${result.modifiedCount} auctions.`);
    }

    // 2. ดึงรายชื่อสินค้าที่เพิ่ง "ended" ภายใน 2 นาทีที่ผ่านมา
    const productsEnded = await Product.find({
      pro_status: "ended",
      endTimeAuction: {
        $lt: now,
        $gte: twoMinutesAgo,
      },
    });

    // 3. ตรวจสอบว่ามีสินค้าที่จบลงจริงๆ ไหมก่อนสร้าง Notification
    if (productsEnded.length > 0) {
      // 💡 ใช้ .map() เพื่อสร้าง Array ของ Notification สำหรับทุกคน
      const notifications = productsEnded.map((product) => ({
        notic_id: Math.random().toString(36).substring(2, 9),
        acc_id: product.pro_accby, // ดึงจากรายชิ้นใน Loop
        pro_id: product.pro_id,
        status: "winner",
      }));

      console.log("Sending notifications:", notifications);
      
      // ส่งข้อมูลผ่าน Socket/Broadcast
      broadcastWinner(notifications);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error("CRON JOB FAILED:", error);
  }
};

exports.coinPacket = async (userId, coinPacket) => {
  const user = await User.findOne({ acc_id: userId });

  if (!user) {
    throw new Error("User not found, contact team service");
  }

  if (coinPacket <= 0 || typeof coinPacket !== "number") {
    console.log(1);
    throw new Error("Coin Packet invalid");
  }

  const updatedUser = await User.findOneAndUpdate(
    { acc_id: userId },
    { $inc: { acc_coin: +coinPacket } },
    { new: true },
  );

  return updatedUser;
};
