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
    const userId = req.params.id;
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
    acc_username,
    acc_email,
    acc_password,
    acc_firstname,
    acc_lastname,
    acc_phone,
    acc_address,
    acc_coin,
  } = req.body; // ดึงข้อมูลจาก request ที่ส่งมาจาก frontend

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


exports.updatePasswordById = async (req, res, next) => {
  const userId = req.user.id;
  const { currectPassword, newPassword } = req.body;

    if (!currectPassword || !newPassword) {
      const error = new Error("currectPassword and newPassword are required for update password.");
      error.statusCode = 400;
      return next(error);
    }

    if (currectPassword.length < 6 || newPassword.length <6) {
      const error = new Error("Password minimum length is 6 characters.");
      error.statusCode = 400;
      return next(error);
    }

  try { 
    const updatePassword = await authService.updatePassword(userId, currectPassword, newPassword);
    return res.
              status(200).
              json({ message: 'update password successfully' })
  } catch (error) {
    return next(error);
    
  }
}



exports.forgotPassword = async(req, res, next) => {
    const { acc_email } = req.body;

    try {
      const user = await authService.forgotPassword(acc_email)
      res.status(200).json({user})
    } catch (error) {
      return next(error)
    }
}



exports.resetPassword = async (req, res, next) => {
    // 1. 🔑 Tech Stack: Token มาจาก URL Parameter
    const token = req.params.token; 
    
    // 2. 🔑 Tech Stack: New Password มาจาก Body
    const { newPassword } = req.body; 

    // 3. Validation: ตรวจสอบความครบถ้วนและความยาว
    if (!token || !newPassword || newPassword.length < 6) {
        const error = new Error("Token and a valid new password (min 6 chars) are required.");
        error.statusCode = 400; 
        return next(error);
    }
    
    try {
        // 4. Call Service
        const result = await authService.resetPassword(token, newPassword);

        // 5. Response
        return res
            .status(200) 
            .json(result); 
            
    } catch (error) {
        return next(error);
    }
};