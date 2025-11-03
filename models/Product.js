const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    pro_id: {
      type: Number,
      required: true,
      unique: true, // ⬅️ CRITICAL: ต้องไม่ซ้ำกัน
      trim: true,
      // อาจเพิ่ม index: true เพื่อเพิ่มความเร็วในการค้นหา
    },
    pro_name: {
        type: String,
        trim: true,
    },
    // 🔑 Tech Stack: passwordHash ต้องถูกเลือกออกโดยค่าเริ่มต้น (Security)
    pro_des: {
        type: String
    },
    
    // ข้อมูล Profile (สำหรับ Update)
    pro_price: { type: Number, trim: true , default: 0},
    pro_time: { type: Number },
    pro_status: {
        type: String,
        trim: true,
    },
    pro_imgurl: { type: String },
    pro_datecome: { type: Date},
    pro_dateend: { type: Date},
    pro_accby: { type: String},
    pro_likecount: { type: Number},
    likes: [{
        type: String,
        ref: 'User'
    }]
}, {
    // 💡 UX/UI: ให้ Mongoose จัดการ timestamp อัตโนมัติ (createdAt, updatedAt)
    timestamps: true 
});

// เราไม่ต้องใช้ Logic `getNextUserId` แล้ว เพราะ MongoDB จะสร้าง _id ให้เอง (ObjectId)

module.exports = mongoose.model('Product', productSchema);