const Counter = require('../models/Counter'); // ⚠️ ต้อง import Counter Model

/**
 * @description ดึงและเพิ่มเลขลำดับถัดไปของ Collection นั้นๆ อย่างปลอดภัย (Atomic Operation)
 * @param {string} collectionName - ชื่อของ Collection ที่ต้องการนับ (เช่น 'user')
 * @returns {number} เลขลำดับถัดไป (เช่น 1, 2, 3)
 */
exports.getNextSequenceValue = async (collectionName) => {
    // 🔑 Tech Stack: ใช้ findOneAndUpdate และ $inc
    const counter = await Counter.findOneAndUpdate(
        { _id: collectionName }, // 1. ค้นหา Counter ของ User Collection
        { $inc: { sequence_value: 1 } }, // 2. Atomic Operation: เพิ่มค่า sequence_value ขึ้น 1
        { new: true, upsert: true } // 3. new: true เพื่อคืนค่าที่อัปเดตแล้ว, upsert: true เพื่อสร้าง Document ถ้ายังไม่มี
    );

    // 💡 Return: ส่งเลขลำดับใหม่กลับไป
    return counter.sequence_value;
};
