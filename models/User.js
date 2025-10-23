const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    acc_id: {
      type: Number,
      required: true,
      unique: true, // ⬅️ CRITICAL: ต้องไม่ซ้ำกัน
      trim: true,
      // อาจเพิ่ม index: true เพื่อเพิ่มความเร็วในการค้นหา
    },
    acc_username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    acc_password: {
      type: String,
      required: true,
      select: false, // ⬅️ CRITICAL: ไม่ดึงค่านี้ออกมาเมื่อเรียก Find ธรรมดา
    },

    acc_firstname: { type: String, trim: true },
    acc_lastname: { type: String, trim: true },
    acc_email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    acc_phone: { type: String, trim: true },
    acc_address: { type: String },
    acc_coin: { type: Number },
    acc_createdate: {type: Date}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
