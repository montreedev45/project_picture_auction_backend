const authService = require("../services/authService"); //import service

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await authService.getUsers();
    return res
      .status(200)
      .json({ message: "Users fetched successfully", users });
  } catch (error) {
    return next(error);
  }
};

// Get users by ID
exports.getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await authService.getUserById(userId);
    return res
      .status(200)
      .json({ message: "User By Id fetched successfully", user });
  } catch (error) {
    return next(error);
  }
};

// Register
exports.register = async (req, res, next) => {
  const {
    username,
    email,
    password,
    firstname,
    lastname,
    phone,
    address,
    coin = 10000,
  } = req.body; // ดึงข้อมูลจาก request ที่ส่งมาจาก frontend

  try {
    if (!username || !email || !password) {
      const err = new Error("Username, email, and password are required.");
      err.statusCode = 400;
      throw err;
    }

    if (password.length < 6) {
      const err = new Error("Password must be at least 6 characters long.");
      err.statusCode = 400;
      throw err;
    }

    if (!email.includes("@")) {
      const err = new Error("Invalid email format.");
      err.statusCode = 400;
      throw err;
    }

    const newUser = await authService.registerUser(
      username,
      email,
      password,
      firstname,
      lastname,
      phone,
      address,
      coin
    );
    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    const error = new Error("username and password are required for login.");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const { token, user } = await authService.loginUser(username, password);

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateUserById = async (req, res, next) => {
  const targetUserId = req.user.id;
  const updates = req.body;

  try {
    const updatedUser = await authService.updateUserProfile(
      targetUserId,
      updates
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  const updateFields = { ...req.body };
  const userId = req.user.id;
  const newFile = req.file; // ข้อมูลไฟล์จาก Multer

  // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
  if (Object.keys(updateFields).length === 0 && !newFile) {
    return res.status(200).json({ message: "No changes detected." });
  }

  try {
    // 🔑 1. เรียกใช้ Service แทนการเขียน Logic ทั้งหมดที่นี่
    const updatedUser = await authService.updateUserProfile2(
      userId,
      updateFields,
      newFile
    );

    // 2. จัดการ Response
    res.status(200).json({
      message: "Profile updated successfully!",
      fileName: updatedUser.acc_profile_pic,
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatePasswordById = async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const error = new Error(
      "currentPassword and newPassword are required for update password."
    );
    error.statusCode = 400;
    return next(error);
  }

  if (currentPassword.length < 6 || newPassword.length < 6) {
    const error = new Error("Password minimum length is 6 characters.");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const updatePassword = await authService.updatePassword(
      userId,
      currentPassword,
      newPassword
    );
    return res.status(200).json({ message: "update password successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { acc_email } = req.body;

  try {
    const user = await authService.forgotPassword(acc_email);
    res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1. 🔑 Tech Stack: Token มาจาก URL Parameter
  const token = req.params.token;

  // 2. 🔑 Tech Stack: New Password มาจาก Body
  const { newPassword } = req.body;

  // 3. Validation: ตรวจสอบความครบถ้วนและความยาว
  if (!token || !newPassword || newPassword.length < 6) {
    const error = new Error(
      "Token and a valid new password (min 6 chars) are required."
    );
    error.statusCode = 400;
    return next(error);
  }

  try {
    // 4. Call Service
    const result = await authService.resetPassword(token, newPassword);

    // 5. Response
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

exports.checkTokenStatus = (req, res) => {
  // 💡 ถ้าโค้ดมาถึงบรรทัดนี้ได้ หมายความว่า Token VALID 100%
  res.status(200).json({
    message: "Token is valid.",
    user: req.user, // ข้อมูล user ที่ได้จาก Middleware protect
  });
};
