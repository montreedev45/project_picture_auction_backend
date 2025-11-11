// migrate.js (ปรับปรุงเพื่อจัดการ Cloud Quota และ Null Value)

// 💡 Tech Stack: Mongoose, Node.js
const mongoose = require("mongoose");

// ⚠️ WARNING: ต้อง Import Model ที่ถูกต้องของคุณมาใช้
const Product = require("./models/Product");

// ----------------------------------------------------
// 🔑 ข้อมูลการเชื่อมต่อ DB ของคุณ
// ----------------------------------------------------
const MONGO_URI =
  "mongodb+srv://montreedev45_db_user:ZYZ9yw0sM61kGEB5@auction-picture.jkvfaeq.mongodb.net/picture_auction_db";
const FIELD_START = "startTimeAuction";
const FIELD_END = "endTimeAuction";

async function runMigration() {
  let modifiedCount = 0;

  try {
    // 1. เชื่อมต่อฐานข้อมูล
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // 2. กำหนด Filter ที่ยืดหยุ่น: ค้นหาเอกสารที่ไม่มี Field เลย ($exists: false)
    //    หรือเอกสารที่มี Field แต่ค่าเป็น null (ซึ่งเป็นค่าที่ Mongoose อาจบันทึกไว้ชั่วคราว)
    const filter = {
      $or: [{ [FIELD_START]: { $ne: null } }, { [FIELD_END]: { $ne: null } }],
    };

    // 🔑 3. ใช้ find() และวนซ้ำ (เพื่อหลีกเลี่ยงข้อจำกัดของ updateMany ใน Atlas Free Tier)
    const productsToReset = await Product.find(filter).select(
      `${FIELD_START} ${FIELD_END}`
    );

    console.log(`- Found ${productsToReset.length} documents to reset.`);

    // 3. วนซ้ำและอัปเดตทีละรายการ
    for (const product of productsToReset) {
      // 💡 Business Logic: ตั้งค่าเป็น null (ล้างค่า)
      product[FIELD_START] = null;
      product[FIELD_END] = null;

      await product.save(); // ⬅️ บันทึกทีละ Document
      modifiedCount++;
    }

    console.log("--------------------------------------------------");
    console.log(`✨ Reverse Migration Complete (Reset to NULL)`);
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
// เรียกใช้ฟังก์ชันหลัก
runMigration();
