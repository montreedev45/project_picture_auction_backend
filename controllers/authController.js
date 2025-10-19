const authService = require("../services/authService");

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
  const { username, email, password, firstname, lastname, phone, address } =
    req.body; // ดึงข้อมูลจาก request ที่ส่งมาจาก frontend

  try {
    const newUser = await authService.registerUser(
      username,
      email,
      password,
      firstname,
      lastname,
      phone,
      address
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
