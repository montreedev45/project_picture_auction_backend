// migrate.js (ปรับปรุงเพื่อจัดการ Cloud Quota และ Null Value)
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI =
  "mongodb+srv://montreedev45_db_user:ZYZ9yw0sM61kGEB5@auction-picture.jkvfaeq.mongodb.net/picture_auction_db";
const FIELD = "pro_min_increment";
const DEFAULT_VALUE = 100; // 💡 กำหนดค่า Default ที่นี่

async function runMigration() {
  let modifiedCount = 0;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // --------------------------------------------------------------------
    // 🔑 2. แก้ไข Filter Logic: ค้นหาเอกสารที่ต้องการตั้งค่าเริ่มต้นเท่านั้น
    // --------------------------------------------------------------------
    const filter = {
      $or: [
        // 1. เอกสารที่ไม่มี Field นี้เลย ($exists: false)
        { [FIELD]: { $exists: false } },
        // 2. เอกสารที่มี Field นี้ แต่ค่าเป็น null (หรือ undefined/ค่าว่าง)
        { [FIELD]: null }, // MongoDB ตีความ null ว่ารวมถึง undefined ด้วยในหลายกรณี
      ],
    };

    // 🔑 3. ใช้ find() และวนซ้ำ
    // ใช้ .select() เพื่อดึง Field pro_min_increment และ _id เท่านั้น (ช่วยให้เร็วขึ้น)
    const productsToReset = await Product.find(filter).select(`_id ${FIELD}`);

    console.log(`- Found ${productsToReset.length} documents to initialize.`);

    // 3. วนซ้ำและอัปเดตทีละรายการ
    for (const product of productsToReset) {
      // 💡 Business Logic: ตั้งค่าเป็น 100
      product[FIELD] = DEFAULT_VALUE;

      await product.save();
      modifiedCount++;
    }

    console.log("--------------------------------------------------");
    console.log(
      `✨ Migration Complete (Set Default Value to ${DEFAULT_VALUE})`
    );
    console.log(`- Documents Processed: ${productsToReset.length}`);
    console.log(`- Modified Documents: ${modifiedCount}`);
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Migration Failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit();
  }
}

runMigration();
