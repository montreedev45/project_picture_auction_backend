// import function ที่ต้องใช้จาก mockUserData file
const { getAllUsersFromDB, findUserByEmail, saveNewUser, findUserByUsername, findUserByField, updateUser } = require('../mockdata/mockUserData') 
const bcrypt = require('bcrypt');
const saltRounds = 5; // ยิ่งมากยิ่งปลอดภัย แต่ยิ่งช้า

async function hashPasswordAndSave(plainTextPassword) {
    // 1. Hash รหัสผ่าน
    const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);

    // 2. บันทึกเฉพาะ 'passwordHash' ลงใน Database 
    // ... repository.createUser(email, passwordHash, ...);
    
    return passwordHash;
}


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

    const newpasswordHash = await hashPasswordAndSave(password)
    console.log('passwordhash : ',newpasswordHash)
    // save new user
    const newUser = await saveNewUser({ username, email, newpasswordHash, firstname, lastname, phone, address });
    //console.log("Password ที่ถูก Hash แล้ว:", newUser.passwordHash)

    //const { passwordHash, ...userWithoutHash } = newUser;  //เอา passwordHash ออกจาก  newUser object และสร้าง userWithoutHash object ใหม่
    return newUser;
};

// Login
exports.loginUser = async (username, password) => {
    
    //check username
    //console.log('password',password)
    const user = await findUserByUsername(username); 
    if (!user) {
        const error = new Error('Invalid credentials.'); // 401 Unauthorized
        error.statusCode = 401; 
        throw error;
    }
    console.log(user.passwordHash)

    // Check: Compare Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    //console.log(isMatch)

    if (!isMatch) {
        const error = new Error('Invalid credentials.'); 
        error.statusCode = 401; 
        throw error;
    }

    // 3. Token Generation
    const token = mockGenerateToken(user.id);
    //console.log(`token : `, token)

    // 4. Return (Strip Hash)
    const { passwordHash, ...userWithoutHash } = user;
    
    return {
        token,
        user: userWithoutHash,
    };
};

const allowedUpdates = ['username', 'firstname', 'lastname', 'email', 'phone', 'address'];


exports.updateUserProfile = async(targetUserId, updates) => {
    
    const rawUsers = await getAllUsersFromDB(); 
    const user = rawUsers.find(p => p.id === parseInt(targetUserId));
    console.log(user)
    
    if (!user) {
        console.log(45)
        // 💡 Business Logic: ส่ง Error กลับไปให้ Controller จัดการ Status Code (404)
        throw new Error('User not found.'); 
    }

    // Step 2: Whitelisting - กรองเฉพาะฟิลด์ที่อนุญาต
    const finalUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key) && updates[key] !== undefined) {
            finalUpdates[key] = updates[key];
        } 
    });

    // Step 3: Business Logic - ตรวจสอบ Email ซ้ำ
    if (finalUpdates.email && finalUpdates.email !== user.email) {
        const existingUser = await findUserByField('email', finalUpdates.email);
        
        // 💡 Logic: ถ้ามีผู้ใช้คนอื่น (id ไม่ตรงกัน) ใช้อีเมลนี้อยู่แล้ว
        if (existingUser && existingUser.id !== targetUserId) { 
            // ส่ง Error กลับไปให้ Controller จัดการ Status Code (400)
            throw new Error('This email is already in use by another user.');
        }
    }
    // 🔑 Step 4: เรียก Repository เพื่อจัดการ Persistence (การบันทึก Mock File)
    const updatedUser = await updateUser(targetUserId, finalUpdates);
    console.log(updatedUser)
    // Step 5: Business Logic - ซ่อนรหัสผ่านก่อนคืนค่า
    if (updatedUser) {
        updatedUser.password = undefined; 
    }

    // ✅ Return ค่าสุดท้ายที่ผ่าน Business Logic และ Persistence แล้ว
    return updatedUser;
};