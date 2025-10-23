
const bcrypt = require('bcrypt');
const saltRounds = 5; // ยิ่งมากยิ่งปลอดภัย แต่ยิ่งช้า
const User = require('../models/User');

async function hashPasswordAndSave(plainTextPassword) {

    if (!plainTextPassword || typeof plainTextPassword !== 'string' || plainTextPassword.length === 0) {
        // 💡 Business Logic: โยน Error ที่สื่อสารได้ดีกว่า
        throw new Error('Invalid or empty password provided for hashing.');
    }
    const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);

    return passwordHash;
}


// // compare ( Input password === Hash password ) 
// const mockComparePassword = (inputPassword, hashedPassword) => {
//     const expectedHash = `Hashed_${inputPassword}_ABC`;
//     return expectedHash === hashedPassword;
// };

// Gen token
//const mockGenerateToken = (userId) => `MOCK_JWT_TOKEN_${userId}_${Date.now()}`;

// Get all users
exports.getUsers = async () => {
    return await User.find();
};

//Get user by id
exports.getUserById = async (UserId) => {

    const queryId = Number(UserId); 
        
    const user = await User.findOne({ acc_id: queryId }); 
    
    if (!user) {
        // 💡 Best Practice: โยน Error ที่มี Status Code 404
        const error = new Error(`User with ID ${UserId} not found.`);
        error.statusCode = 404; // HTTP Not Found
        throw error; 
    }

    return user;
};

// // Register
exports.registerUser = async (
    username, 
    email, 
    password, 
    firstname, 
    lastname, 
    phone, 
    address, 
    acc_coin = 10000, // 🔑 กำหนดค่า Default ใน Service Layer
    acc_createdate = new Date() // 🔑 กำหนดค่า Default ใน Service Layer
) => {
    
    // 1. INPUT VALIDATION: ตรวจสอบ Input ทั้งหมดอย่างละเอียด
    // (ใช้ Trim() สำหรับ String เพื่อลบช่องว่างหัวท้ายก่อนตรวจสอบ)
    //const requiredFields = [username, email, password, firstname, lastname, phone, address];

    // if (requiredFields.some(field => !field || (typeof field === 'string' && field.trim() === '')) || password.length < 6) {
    //     const error = new Error('Username, valid email, password (min 6 chars), Firstname, Lastname, Phone, and Address are required.');
    //     error.statusCode = 400; // Bad Request
    //     throw error;
    // }

    // 2. CONFLICT CHECK: ตรวจสอบความซ้ำซ้อนของอีเมล (Uncommented and implemented)
    // ⚠️ ต้องมีฟังก์ชัน findUserByEmail() ที่เรียก Mongoose Query เช่น User.findOne({ email: email })
    // const existingUser = await findUserByEmail(email); 
    // if (existingUser) {
    //     const error = new Error('This email is already registered.');
    //     error.statusCode = 409; // HTTP Conflict
    //     throw error;
    // }

    // 3. PASSWORD HASHING: Hash รหัสผ่านก่อนบันทึก
    // ⚠️ ต้องมีฟังก์ชัน hashPasswordAndSave() ที่ใช้ Library เช่น bcrypt
    const passwordHash = await hashPasswordAndSave(password);
    
    // 4. SAVE NEW USER: บันทึกข้อมูลผู้ใช้ใหม่ลงฐานข้อมูล
    const newUser = await saveNewUser({ 
        username: username.trim(), 
        email: email.trim(), 
        passwordHash, // ใช้ค่าที่ Hash แล้ว
        firstname: firstname.trim(), 
        lastname: lastname.trim(), 
        phone: phone.trim(), 
        address: address.trim(),
        acc_coin,
        acc_createdate
    });
    
    // 5. RETURN: คืนค่า Document ที่ถูกสร้างใหม่
    // 💡 ควรมีการใช้ .select('-passwordHash') หรือการซ่อนรหัสผ่านก่อนคืนค่าให้ Client
    return newUser;
};

// // Login
// exports.loginUser = async (username, password) => {
    
//     //check username
//     //console.log('password',password)
//     const user = await findUserByUsername(username); 
//     if (!user) {
//         const error = new Error('Invalid credentials.'); // 401 Unauthorized
//         error.statusCode = 401; 
//         throw error;
//     }
//     console.log(user.passwordHash)

//     // Check: Compare Password
//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     //console.log(isMatch)

//     if (!isMatch) {
//         const error = new Error('Invalid credentials.'); 
//         error.statusCode = 401; 
//         throw error;
//     }

//     // 3. Token Generation
//     const token = mockGenerateToken(user.id);
//     //console.log(`token : `, token)

//     // 4. Return (Strip Hash)
//     const { passwordHash, ...userWithoutHash } = user;
    
//     return {
//         token,
//         user: userWithoutHash,
//     };
// };

// const allowedUpdates = ['username', 'firstname', 'lastname', 'email', 'phone', 'address'];


// exports.updateUserProfile = async(targetUserId, updates) => {
    
//     const rawUsers = await getAllUsersFromDB(); 
//     const user = rawUsers.find(p => p.id === parseInt(targetUserId));
//     console.log(user)
    
//     if (!user) {
//         console.log(45)
//         // 💡 Business Logic: ส่ง Error กลับไปให้ Controller จัดการ Status Code (404)
//         throw new Error('User not found.'); 
//     }

//     // Step 2: Whitelisting - กรองเฉพาะฟิลด์ที่อนุญาต
//     const finalUpdates = {};
//     Object.keys(updates).forEach(key => {
//         if (allowedUpdates.includes(key) && updates[key] !== undefined) {
//             finalUpdates[key] = updates[key];
//         } 
//     });

//     // Step 3: Business Logic - ตรวจสอบ Email ซ้ำ
//     if (finalUpdates.email && finalUpdates.email !== user.email) {
//         const existingUser = await findUserByField('email', finalUpdates.email);
        
//         // 💡 Logic: ถ้ามีผู้ใช้คนอื่น (id ไม่ตรงกัน) ใช้อีเมลนี้อยู่แล้ว
//         if (existingUser && existingUser.id !== targetUserId) { 
//             // ส่ง Error กลับไปให้ Controller จัดการ Status Code (400)
//             throw new Error('This email is already in use by another user.');
//         }
//     }
//     // 🔑 Step 4: เรียก Repository เพื่อจัดการ Persistence (การบันทึก Mock File)
//     const updatedUser = await updateUser(targetUserId, finalUpdates);
//     console.log(updatedUser)
//     // Step 5: Business Logic - ซ่อนรหัสผ่านก่อนคืนค่า
//     if (updatedUser) {
//         updatedUser.password = undefined; 
//     }

//     // ✅ Return ค่าสุดท้ายที่ผ่าน Business Logic และ Persistence แล้ว
//     return updatedUser;
// };



const saveNewUser = async (userData) => {
    // 💡 Tech Stack: ใช้ Mongoose Model ในการสร้างและบันทึก Document ใหม่
    const newUser = new User({
        acc_username: userData.username,
        acc_email: userData.email,
        acc_password: userData.passwordHash, // Mongoose จะจัดการ select: false ให้เอง
        acc_firstname: userData.firstname,
        acc_lastname: userData.lastname,
        acc_phone: userData.phone,
        acc_address: userData.address,
        acc_coin: userData.acc_coin,
        acc_createdate: userData.acc_createdate
        // ไม่ต้อง save acc_createdate เพราะ Mongoose จัดการด้วย timestamps: true
    });

    await newUser.save();
    return newUser;
};