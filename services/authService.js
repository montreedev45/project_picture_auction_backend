// import function ที่ต้องใช้จาก mockUserData file
const { getAllUsersFromDB, findUserByEmail, saveNewUser, findUserByUsername } = require('../mockdata/mockUserData') 

// compare ( Input password === Hash password ) 
const mockComparePassword = (inputPassword, hashedPassword) => {
    const expectedHash = `Hashed_${inputPassword}_ABC`;
    return expectedHash === hashedPassword;
};

// Gen token
const mockGenerateToken = (userId) => `MOCK_JWT_TOKEN_${userId}_${Date.now()}`;

// Get all users
exports.getUsers = async () => {

    const rawUsers = await getAllUsersFromDB(); 

    const processedUsers = rawUsers.map(user => {
        
        return {
            id: user.id,
            username: user.username,
            password: user.password,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            address: user.address
        };
    });

    return processedUsers;
};

//Get user by id
exports.getUserById = async (UserId) => {

    const rawUsers = await getAllUsersFromDB(); 

    const user = rawUsers.find(p => p.id === parseInt(UserId));

    if (!user) {
        // 🛑 Best Practice: โยน Error ที่มี Status Code ชัดเจน
        const error = new Error(`User with ID ${UserId} not found.`);
        error.statusCode = 404; // HTTP Not Found
        throw error;
    }

    const processedUser = {
        id: user.id,
        username: user.username,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        address: user.address
    };
    return processedUser;

};

// Register
exports.registerUser = async (username, email, password, firstname, lastname, phone, address) => {
    
    //check input
    if (!username || !email || !password || password.length < 6 || !firstname || !lastname || !phone || !address) {
        const error = new Error('Username, valid email, password (min 6 chars), Firstname, Lastname, Phone, and Address are required.');
        error.statusCode = 400;
        throw error;
    }
    
    //check conflict email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        const error = new Error('This email is already registered.');
        error.statusCode = 409; // HTTP Conflict
        throw error;
    }

    // save new user
    const newUser = await saveNewUser({ username, email, password, firstname, lastname, phone, address });
    console.log("Password ที่ถูก Hash แล้ว:", newUser.passwordHash)

    const { passwordHash, ...userWithoutHash } = newUser;
    return userWithoutHash;
};

// Login
exports.loginUser = async (username, password) => {
    
    //check username
    const user = await findUserByUsername(username); 
    if (!user) {
        const error = new Error('Invalid credentials.'); // 401 Unauthorized
        error.statusCode = 401; 
        throw error;
    }

    // Check: Compare Password
    const isMatch = mockComparePassword(password, user.passwordHash);
    if (!isMatch) {
        const error = new Error('Invalid credentials.'); 
        error.statusCode = 401; 
        throw error;
    }

    // 3. Token Generation
    const token = mockGenerateToken(user.id);
    console.log(`token : `, token)

    // 4. Return (Strip Hash)
    const { passwordHash, ...userWithoutHash } = user;
    
    return {
        token,
        user: userWithoutHash,
    };
};