const authService = require("../services/authService");

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await authService.getUsers();
    console.log('user: ',users)
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
    const UserId = req.params.id;
    const user = await authService.getUserById(UserId);
    return res
      .status(200)
      .json({ message: "User By Id fetched successfully", user });
  } catch (error) {
    return next(error);
  }
};

// Register
exports.register = async (req, res, next) => {
  const { acc_username, acc_email, acc_password, acc_firstname, acc_lastname, acc_phone, acc_address, acc_coin } = req.body; // ดึงข้อมูลจาก request ที่ส่งมาจาก frontend
  console.log(req.body)
  try {
    const newUser = await authService.registerUser(
      acc_username,
      acc_email,
      acc_password,
      acc_firstname,
      acc_lastname,
      acc_phone,
      acc_address,
      acc_coin
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
  const { username, password } = req.body; // ดึง username , password จาก request ที่ส่งมาจาก frontend

  if (!username || !password) {
    // check username , password
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


exports.updateUserById = async(req, res, next) => {
    const targetUserId = req.params.id; 
    const updates = req.body;
    
    try {
        const updatedUser = await authService.updateUserProfile(targetUserId, updates); // ⬅️ แก้ไขชื่อ Service ให้ชัดเจนและส่ง Object เดียว
        if (!updatedUser) {
            // กรณีที่ Service คืนค่า null กลับมา (เช่น หา user ไม่เจอ)
             return res.status(404).json({ message: "User not found." });
        }
        
        // ✅ Tech Stack: Status 200/202 สำหรับ Update สำเร็จ
        return res
            .status(200) // 200 OK หรือ 202 Accepted
            .json({ 
                message: "User profile updated successfully.", 
                user: updatedUser // 💡 Service ได้จัดการลบ password ออกแล้ว
            });

    } catch (error) {
        console.error("Profile update error:", error.message);
        
        // 💡 Error Handling: จัดการ Error Status Code ตามประเภทของ Error ที่มาจาก Service
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('already in use')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('forbidden')) {
            return res.status(403).json({ message: error.message });
        }
        
        // Fallback 500
        res.status(500).json({ message: "Server error during profile update.", error: error.message });
    }
}