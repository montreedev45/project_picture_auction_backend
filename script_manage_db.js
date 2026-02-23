const mongoose = require("mongoose");
const Bids = require("./models/Bid");
const Product = require("./models/Product");
const MONGO_URI =
  "";

async function delete_db() {
  try {
    // 1. เชื่อมต่อฐานข้อมูลก่อนเสมอ
    await mongoose.connect(MONGO_URI);
    console.log("Connection successfully");

    // 2. เริ่มต้น Session หลังจากเชื่อมต่อแล้ว
    const session = await mongoose.startSession();

    // 3. เริ่มต้น Transaction
    session.startTransaction();

    try {
      // 4. สั่งลบข้อมูล
      const result = await Bids.deleteMany({ pro_id: 2 }, { session });
      console.log(`${result.deletedCount} records were deleted.`);

      // 💡 ใน deleteMany ถ้าไม่เจอข้อมูล result.deletedCount จะเป็น 0 (ไม่ใช่ null)
      if (result.deletedCount === 0) {
        console.warn("No bids found with pro_id: 2");
      }

      // 5. ยืนยันการทำงาน
      await session.commitTransaction();
      console.log("Transaction committed.");
    } catch (error) {
      // 🛑 หากพังระหว่างทาง ให้ Rollback
      await session.abortTransaction();
      throw error; // ส่งต่อ error ไปที่ catch ตัวนอก
    } finally {
      // 🔚 ปิด Session เสมอ
      session.endSession();
    }
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูลเมื่อจบการทำงาน (สำหรับ Script ที่รันแยก)
    await mongoose.connection.close();
  }
}

async function update_db() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connection successfully");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ ยุบรวม $set และ $unset ไว้ในคำสั่งเดียวเพื่อ Performance
      const updatedProduct = await Product.findOneAndUpdate(
        { pro_id: 2 },
        { 
          $set: { pro_price: 100, pro_status: "", pro_accby: "", pro_time: 60 },
          $unset: { endTimeAuction: 1, startTimeAuction: 1 } 
        },
        { new: true, session } // new: true เพื่อให้ return ข้อมูลหลังอัปเดต
      );

      if (updatedProduct) {
        console.log("Updated Data:", updatedProduct);
        // ⚠️ สำคัญที่สุด: ต้องมีบรรทัดนี้ ข้อมูลถึงจะลง DB จริง!
        await session.commitTransaction(); 
        console.log("Transaction committed successfully!");
      } else {
        console.log("Product not found!");
        await session.abortTransaction();
      }

      const result = await Bids.deleteMany({ pro_id: 2 }, { session });
      console.log(`${result.deletedCount} records were deleted.`);

    } catch (error) {
      console.error("Internal Error:", error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Connection Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
}

update_db();
// delete_db();
