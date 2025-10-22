// Hash password
//const mockHashPassword = (password) => `Hashed_${password}_ABC`;

let initialUsers = [
    { id: 1, username: "user1", passwordHash: "$2b$05$VoLbri1IW2djJS.T1DSLs.h3DtR10unL1y8x0/Bo6VS/a1rbHk60y" , firstname: "montree", lastname: "chanuanklang", email: "test@gmail.com", phone: "0123456789", address: "mukdahan", createdAt: new Date().toISOString()},
    { id: 2, username: "user2", passwordHash: "$2b$05$Pp2C.LEgNOkechYdX4DwhuCUw0lMRt1BxoY6JKF2CX4IuTdeXmxOW" , firstname: "jirawan", lastname: "pangpun", email: "test@gmail.com", phone: "0123456789", address: "mukdahan", createdAt: new Date().toISOString()},
];
//password user1 : "ae123456"
//password user2 : "earn1234"


// Gen new ID
const getNextUserId = () => {
    if (initialUsers.length === 0) return 1; 
    
    const maxId = initialUsers.reduce((max, user) => (user.id > max ? user.id : max), 0);
    return maxId + 1;
};

// Get all users
exports.getAllUsersFromDB = async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); 
    return initialUsers;
};

// Check by email
exports.findUserByEmail = async (email) => {
    // 💡 Business Logic: จำลองความล่าช้า
    await new Promise(resolve => setTimeout(resolve, 30)); 
    return initialUsers.find(u => u.email === email);
};

//Check by username
exports.findUserByUsername = async (username) => {
    // 💡 Business Logic: จำลองความล่าช้า
    await new Promise(resolve => setTimeout(resolve, 30)); 
    return initialUsers.find(u => u.username === username);
};

// Save new user in initialUsers
exports.saveNewUser = async ({ username, email, passwordHash, firstname, lastname, phone, address }) => {

    const newId = getNextUserId(); 
    //const passwordHash = mockHashPassword(password);
    const createdAt = new Date().toISOString(); // time stamp date (string)

    const newUser = {
        id: newId,
        username,
        email,
        passwordHash,
        firstname,
        lastname,
        phone,
        address,
        createdAt,
    };

    initialUsers.push(newUser); // add new user in initialUsers

    return newUser;
};


exports.updateUser = async (id, updates) => {
    // 1. หา Index ของผู้ใช้ใน Array
    const userIdNumber = parseInt(id, 10);
    const userIndex = initialUsers.findIndex(u => u.id === userIdNumber);

    if (userIndex === -1) {
        return null; // ไม่พบผู้ใช้
    }

    // 2. นำข้อมูล updates ที่ผ่านการกรองแล้วมารวมกับข้อมูลเดิม
    // 💡 Best Practice: ใช้ spread operator ในการรวม Object
    const updatedUser = {
        ...initialUsers[userIndex], // ข้อมูลเก่า
        ...updates             // ข้อมูลใหม่ที่ Service กรองมาแล้ว
    };

    // 3. บันทึกข้อมูลที่อัปเดตแล้วลงใน Mock Array (Persistence Simulation)
    initialUsers[userIndex] = updatedUser;
    
    // 4. คืนค่าข้อมูลที่อัปเดตแล้ว (โดยทำ Deep Copy ก่อน)
    return { ...updatedUser }; 
};


exports.findUserById = async (id) => {
    // 💡 Simulation: แทนที่ด้วย findById() ของ Mongoose หรือ ORM
    const user = initialUsers.find(u => u.id === id);
    // ทำการสร้าง Deep Copy เพื่อป้องกันการแก้ไขข้อมูล Mock โดยตรง
    return user ? { ...user } : null; 
};

exports.findUserByField = async (fieldName, value) => {
    // 💡 Simulation: แทนที่ด้วย findOne({ [fieldName]: value })
    const user = initialUsers.find(u => u[fieldName] === value);
    return user ? { ...user } : null;
};


exports.initialUsers = initialUsers; // Export array นี้เพื่อใช้ในการ Test/Debug