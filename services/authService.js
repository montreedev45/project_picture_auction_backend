const bcrypt = require("bcrypt");
const crypto = require("crypto");
const saltRounds = 5; // ยิ่งมากยิ่งปลอดภัย แต่ยิ่งช้า
const User = require("../models/User");
const fs = require("fs").promises;
const path = require("path");
const uploadDir = path.join(__dirname, "../uploads/profiles");

const { sendEmail } = require("../utils/email");
const { getNextSequenceValue } = require("../utils/idGenerator");
const { generateAuthToken } = require("../utils/tokenHelper");

async function hashPasswordAndSave(plainTextPassword) {
  if (
    !plainTextPassword ||
    typeof plainTextPassword !== "string" ||
    plainTextPassword.length === 0
  ) {
    throw new Error("Invalid or empty password provided for hashing.");
  }
  const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);

  return passwordHash;
}

// Get all users
exports.getUsers = async () => {
  return await User.find();
};

//Get user by id
exports.getUserById = async (UserId) => {
  const user = await User.findOne({ acc_id: UserId });

  if (!user) {
    const error = new Error(`User with ID : ${UserId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// Register
exports.registerUser = async (
  username,
  email,
  password,
  firstname,
  lastname,
  phone,
  address,
  acc_coin
) => {
  const passwordHash = await hashPasswordAndSave(password); //hash password

  const newAccId = await getNextSequenceValue("user"); //สร้าง acc_id ใหม่

  const newUser = await saveNewUser({
    acc_id: newAccId,
    username: username.trim(),
    email: email.trim(),
    passwordHash,
    firstname: firstname.trim(),
    lastname: lastname.trim(),
    phone: phone.trim(),
    address: address.trim(),
    acc_coin,
  });
  return newUser;
};

const saveNewUser = async (userData) => {
  try {
    const newUser = new User({
      acc_id: userData.acc_id,
      acc_username: userData.username,
      acc_email: userData.email,
      acc_password: userData.passwordHash,
      acc_firstname: userData.firstname,
      acc_lastname: userData.lastname,
      acc_phone: userData.phone,
      acc_address: userData.address,
      acc_coin: userData.acc_coin,
    });

    await newUser.save(); //save data in mongoose
    return newUser;
  } catch (dbError) {
    // 🔑 1. ตรวจสอบ Error ที่เจาะจง (เช่น Unique Field Conflict)
    if (dbError.code && dbError.code === 11000) {
      // MongoDB Duplicate Key Error Code
      // 409 Conflict: ข้อมูล Email/Username ซ้ำซ้อน
      const field = Object.keys(dbError.keyValue);
      const err = new Error(`${field[0]} is already registered.`);
      err.statusCode = 409; // ⬅️ Status Code ที่เหมาะสม
      throw err; // ⬅️ โยน Error ที่สร้างใหม่ไปให้ Controller/Handler จัดการ
    }

    // 🔑 2. สำหรับ Error อื่นๆ (เช่น Validation Error หรือ Database ล่ม)
    //    ให้โยน Error เดิม หรือ Error 500 กลับไป
    const err = new Error(dbError.message || "Database operation failed.");
    err.statusCode = dbError.statusCode || 500;
    throw err;
  }
};

// Login
exports.loginUser = async (username, password) => {
  // 🔑 Tech Stack: ใช้ .select('+acc_password') เพื่อเรียกฟิลด์ที่ถูกซ่อนไว้
  const user = await User.findOne({ acc_username: username }).select(
    //check username
    "+acc_password"
  );

  if (!user) {
    const err = new Error("Invalid username or password.");
    err.statusCode = 401;
    throw err;
  }

  let userRespon = user.toJSON(); //แปลงเป็น json เพื่อเอา meta data ออก

  delete userRespon.__v;
  delete userRespon.acc_password;
  delete userRespon._id;
  delete userRespon.createdAt;
  delete userRespon.updatedAt;

  // Check: Compare Password
  const isMatch = await bcrypt.compare(password, user.acc_password);

  if (!isMatch) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  // 3. Token Generation
  const token = generateAuthToken(userRespon);

  return {
    token,
    user: userRespon,
  };
};

// 💡 Business Logic: Field ที่อนุญาตให้อัปเดต (ต้องตรงกับ Schema)
const allowedUpdates = [
  "acc_username",
  "acc_firstname",
  "acc_lastname",
  "acc_email",
  "acc_phone",
  "acc_address",
];

// update
exports.updateUserProfile = async (targetUserId, updates) => {
  const finalUpdates = {};
  const updateKeys = Object.keys(updates); //ดึง key from object  สร้างเป็น array

  //  ตรวจสอบและ Trim ค่าที่เป็น String ไปพร้อมกัน
  updateKeys.forEach((key) => {
    if (allowedUpdates.includes(key) && updates[key] !== undefined) {
      finalUpdates[key] =
        typeof updates[key] === "string" ? updates[key].trim() : updates[key];
    }
  });

  // ถ้า finalUpdates ไม่มีข้อมูลจาก frontend
  if (Object.keys(finalUpdates).length === 0) {
    const error = new Error("No valid fields provided for update.");
    error.statusCode = 400;
    throw error;
  }

  // ตรวจสอบ Email ซ้ำ (ถ้ามีการอัปเดต acc_email)
  const newEmail = finalUpdates.acc_email;

  if (newEmail) {
    const existingUserWithEmail = await User.findOne({ acc_email: newEmail });

    // Logic: ถ้าพบผู้ใช้ และ _id ของผู้ใช้ที่พบ ไม่ตรงกับ _id ของผู้ใช้ที่กำลังอัปเดต
    if (
      existingUserWithEmail &&
      existingUserWithEmail._id.toString() !== targetUserId.toString()
    ) {
      const error = new Error("This email is already in use by another user.");
      error.statusCode = 409;
      throw error;
    }
  }

  const queryAccId = Number(targetUserId); //แปลง id เป็น number

  // อัปเดตและดึง Document ใหม่ในขั้นตอนเดียว
  //ใช้ findOne เพราะจะใช้ id ที่กำหนดเอง
  const updatedUser = await User.findOneAndUpdate(
    { acc_id: queryAccId },
    finalUpdates,
    {
      new: true, //  คืนค่า Document ที่อัปเดตแล้ว
      runValidators: true, // บังคับใช้ Validator ใน Schema เช่น required, unique
    }
  ).select("-acc_password"); // Security: ซ่อนรหัสผ่าน

  if (!updatedUser) {
    const error = new Error(`User with ID ${targetUserId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return updatedUser;
};


exports.updateUserProfile2 = async (userId, updateFields, newFile) => {
    let oldProfilePic = null; // 💡 กำหนดตัวแปรสำหรับรูปเก่า
    
    // 1. ตรวจสอบและจัดการไฟล์
    if (newFile) {
        const user = await User.findOne({ acc_id: userId }).select("acc_profile_pic");
        
        // 🔑 2. เก็บชื่อรูปเก่าไว้ ก่อนที่ DB จะอัปเดต
        oldProfilePic = user?.acc_profile_pic; 
        
        // เพิ่มชื่อไฟล์ใหม่เข้าไปใน Fields ที่จะอัปเดต
        updateFields.acc_profile_pic = newFile.filename;
    }

    try {
        // 3. ติดต่อ Database (Busines Logic ส่วนที่ 2)
        const updatedUser = await User.findOneAndUpdate(
            { acc_id: userId },
            updateFields,
            { new: true, runValidators: true, upsert: false }
        );

        // 🔑 4. ลบไฟล์เก่า *หลังจาก* อัปเดต DB สำเร็จแล้วเท่านั้น
        if (oldProfilePic) {
            const oldFilePath = path.join(uploadDir, oldProfilePic);
            await fs.unlink(oldFilePath).catch(err => {
                // 💡 ถ้าลบไม่ได้ แค่ Log ข้อความ แต่ไม่ throw error
                console.error("Error deleting old profile pic:", oldProfilePic, err);
            });
        }
        
        // 5. คืนค่าผลลัพธ์
        return updatedUser;

    } catch (dbError) {
        // 6. 🛡️ ถ้า DB Error เกิดขึ้น:
        if (newFile) {
             // 🔑 7. ถ้าอัปเดต DB ล้มเหลว ให้ลบไฟล์ใหม่ที่เพิ่งอัปโหลดไปทิ้ง (Rollback Resource)
             //    ป้องกันไฟล์ใหม่ตกค้างบน Server
             const newFilePath = path.join(uploadDir, newFile.filename);
             await fs.unlink(newFilePath).catch(err => console.error("Rollback failed:", err));
        }
        
        // 8. ... Logic การจัดการ E11000 และ throw error ที่เหลือ ...
        // (ส่วนนี้ถูกต้องแล้ว ไม่ต้องแก้ไข)
        if (dbError.code && dbError.code === 11000) { /* ... 409 Conflict Logic ... */ }
        throw dbError;
    }
};

// update password
exports.updatePassword = async (userId, currentPassword, newPassword) => {
  // 1. SECURITY: ค้นหา User และ "บังคับ" ดึง acc_password ที่ถูกซ่อนไว้ (select: false)
  const user = await User.findOne({ acc_id: userId }).select("+acc_password");

  // 2. ตรวจสอบ User Not Found (404)
  if (!user) {
    // 💡 Security Best Practice: ไม่ควรบอกว่า User ไม่พบในการ Login/Update
    const error = new Error("Invalid credentials or user identity.");
    error.statusCode = 401;
    throw error;
  }

  // 3. SECURITY: ยืนยันรหัสผ่านปัจจุบัน (Old Password Check)
  const isMatch = await bcrypt.compare(currentPassword, user.acc_password);

  if (!isMatch) {
    const error = new Error(`The current password you entered is incorrect.`);
    error.statusCode = 401;
    throw error;
  }

  // 4. SECURITY: HASH รหัสผ่านใหม่
  const newPasswordHash = await bcrypt.hash(newPassword, 5);

  // 5. Mongoose Persistence: อัปเดตและบันทึกรหัสผ่านใหม่
  const updatePassword = await User.findOneAndUpdate(
    { acc_id: userId },
    { acc_password: newPasswordHash },
    {
      new: true,
      runValidators: true, // 💡 ทำให้ Mongoose รัน validation ถ้ามี
    }
  ).select("-acc_password"); // 💡 Security: ซ่อนรหัสผ่านใน Response

  return updatePassword;
};

// forgot password
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ acc_email: email });

  if (!user) {
    console.log(`Attempted password reset for unregistered email: ${email}`);
    return {
      message:
        "If the email is registered, you will receive a password reset link.",
    };
  }

  // --- 3. 4. 5. Logic สำหรับ User ที่พบเท่านั้น ---

  // 3. SECURITY: สร้าง Token, Hash, และตั้งวันหมดอายุ (ใช้ Instance Method)
  const resetTokenPlainText = user.getResetPasswordToken();

  // 4. Persistence: บันทึก Hash Token และ Expiry ลงใน DB
  await user.save({ validateBeforeSave: false });

  // 5. Business Logic: เตรียมและส่งอีเมล
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetTokenPlainText}`;
  const message = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on this link to complete the process: 
        <a href="${resetURL}">Click here to reset your password</a></p>
        <p>This link is valid for 20 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

  try {
    // 6. ส่งอีเมล
    await sendEmail({
      email: user.acc_email,
      subject: "Password Reset Token (Valid for 20 minutes)",
      message: message,
    });

    // 7. FINAL RETURN: คืนค่าสำเร็จหลังจากส่งอีเมลสำเร็จ
    return {
      message: "Password reset link sent to your email.",
    };
  } catch (error) {
    // 8. FAILURE LOGIC: ถ้าส่งอีเมลล้มเหลว ลบ Token และโยน Error
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false }); // ลบ Token ออก

    console.error("Email sending failed:", error);
    throw new Error(
      "There was an error sending the reset email. Please try again later."
    );
  }
};

// reset password
exports.resetPassword = async (token, newPassword) => {
  // 1. SECURITY: Hash Token ที่รับมาจาก Client
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. VALIDATION: ค้นหา User ด้วย Token Hash และตรวจสอบวันหมดอายุ
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }, // ⬅ต้องไม่หมดอายุ
  }).select("+acc_password"); // ดึง Password Hash เก่ามาด้วยเพื่อ Hashing Check

  // 3. ERROR HANDLING: Token ไม่ถูกต้อง หรือ หมดอายุ
  if (!user) {
    const error = new Error("Password reset token is invalid or has expired.");
    error.statusCode = 400;
    throw error;
  }

  // 4. HASHING: Hash รหัสผ่านใหม่
  const newPasswordHash = await bcrypt.hash(newPassword, 5);

  // 5. PERSISTENCE: บันทึกรหัสผ่านใหม่และล้าง Token
  user.acc_password = newPasswordHash;

  // ล้าง Token และ Expiry เพื่อป้องกันการใช้ซ้ำ (Token Replay Attack)
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // 6. บันทึกเข้าฐานข้อมูล
  await user.save();

  // 7. 💡 Best Practice: อาจจะสร้าง JWT ใหม่ให้ผู้ใช้ Login ทันที (Optional)
  // const jwtToken = user.getSignedJwtToken();

  return {
    message: "Your password has been successfully reset.",
    // token: jwtToken // (Optional)
  };
};
