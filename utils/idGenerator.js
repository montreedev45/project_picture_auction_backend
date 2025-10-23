const Counter = require('../models/Counter'); 

exports.getNextSequenceValue = async (collectionName) => {
    // 🔑 Tech Stack: ต้องใช้ findOneAndUpdate กับ $inc: { sequence_value: 1 } 
    // และไม่ควรมีฟิลด์ที่ไม่รู้จัก (เช่น acc_id) อยู่ใน Query หรือ Update Body
    const counter = await Counter.findOneAndUpdate(
        // 1. QUERY: ค้นหาด้วย _id (ชื่อ Collection)
        { _id: collectionName }, 
        
        // 2. UPDATE: ใช้ $inc เพื่อเพิ่มค่าในฟิลด์ sequence_value เท่านั้น
        { $inc: { sequence_value: 1 } }, 
        
        // 3. OPTIONS: New Document และ Upsert
        { new: true, upsert: true }
    );
    
    if (!counter) {
        throw new Error(`Failed to initialize or retrieve counter for ${collectionName}`);
    }
    return counter.sequence_value;
};