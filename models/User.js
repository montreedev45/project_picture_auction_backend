const mongoose = require("mongoose");
const crypto = require('crypto'); // 💡 Tech Stack: ใช้สำหรับสร้าง Random Token
const { type } = require("os");

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
    acc_createdate: {type: Date},
    resetPasswordToken: { type: String },     // เก็บ Hash ของ Token ที่ถูกเข้ารหัสแล้ว
    resetPasswordExpire: { type: Date },      // เก็บวันที่/เวลาที่ Token หมดอายุ
    acc_profile_pic: { type: String, default: null }
  },
  {
    timestamps: true,
  }
);


userSchema.methods.getResetPasswordToken = function() {
    // 1. สร้าง Token แบบ Plain Text (Random String)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash Token ก่อนบันทึกใน DB (Security)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. กำหนดวันหมดอายุ (เช่น 20 นาที)
    this.resetPasswordExpire = Date.now() + 20 * 60 * 1000; // 20 minutes in milliseconds

    // 4. Return Token แบบ Plain Text (สำหรับส่งใน Email)
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
