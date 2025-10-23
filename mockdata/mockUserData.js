
// // Get all users
// exports.getAllUsersFromDB = async () => {
//     await new Promise(resolve => setTimeout(resolve, 50)); 
//     return initialUsers;
// };

// // Check by email
// exports.findUserByEmail = async (email) => {
//     // 💡 Business Logic: จำลองความล่าช้า
//     await new Promise(resolve => setTimeout(resolve, 30)); 
//     return initialUsers.find(u => u.email === email);
// };

// //Check by username
// exports.findUserByUsername = async (username) => {
//     // 💡 Business Logic: จำลองความล่าช้า
//     await new Promise(resolve => setTimeout(resolve, 30)); 
//     return initialUsers.find(u => u.username === username);
// };

// // Save new user in initialUsers
// exports.saveNewUser = async ({ username, email, passwordHash, firstname, lastname, phone, address }) => {

//     const newId = getNextUserId(); 
//     //const passwordHash = mockHashPassword(password);
//     const createdAt = new Date().toISOString(); // time stamp date (string)

//     const newUser = {
//         id: newId,
//         username,
//         email,
//         passwordHash,
//         firstname,
//         lastname,
//         phone,
//         address,
//         createdAt,
//     };

//     initialUsers.push(newUser); // add new user in initialUsers

//     return newUser;
// };


// exports.updateUser = async (id, updates) => {
//     // 1. หา Index ของผู้ใช้ใน Array
//     const userIdNumber = parseInt(id, 10);
//     const userIndex = initialUsers.findIndex(u => u.id === userIdNumber);

//     if (userIndex === -1) {
//         return null; // ไม่พบผู้ใช้
//     }

//     // 2. นำข้อมูล updates ที่ผ่านการกรองแล้วมารวมกับข้อมูลเดิม
//     // 💡 Best Practice: ใช้ spread operator ในการรวม Object
//     const updatedUser = {
//         ...initialUsers[userIndex], // ข้อมูลเก่า
//         ...updates             // ข้อมูลใหม่ที่ Service กรองมาแล้ว
//     };

//     // 3. บันทึกข้อมูลที่อัปเดตแล้วลงใน Mock Array (Persistence Simulation)
//     initialUsers[userIndex] = updatedUser;
    
//     // 4. คืนค่าข้อมูลที่อัปเดตแล้ว (โดยทำ Deep Copy ก่อน)
//     return { ...updatedUser }; 
// };


// exports.findUserById = async (id) => {
//     // 💡 Simulation: แทนที่ด้วย findById() ของ Mongoose หรือ ORM
//     const user = initialUsers.find(u => u.id === id);
//     // ทำการสร้าง Deep Copy เพื่อป้องกันการแก้ไขข้อมูล Mock โดยตรง
//     return user ? { ...user } : null; 
// };

// exports.findUserByField = async (fieldName, value) => {
//     // 💡 Simulation: แทนที่ด้วย findOne({ [fieldName]: value })
//     const user = initialUsers.find(u => u[fieldName] === value);
//     return user ? { ...user } : null;
// };


// exports.initialUsers = initialUsers; // Export array นี้เพื่อใช้ในการ Test/Debug










// exports.createUser = async (userData) => {
//     // 💡 Logic: สร้าง Mongoose Document ใหม่และบันทึก
//     const newUser = new User(userData);
//     await newUser.save();
    
//     // Mongoose จะคืนค่า Object ที่ไม่มี passwordHash (เพราะ select: false)
//     return newUser; 
// };

// exports.findUserForLogin = async (username) => {
//     // 🔑 CRITICAL TECH STACK: ต้องใช้ .select('+passwordHash')
//     return await User.findOne({ username: username }).select('+passwordHash');
// };
// exports.findUserById = async (id) => {
//     // 💡 Logic: Mongoose findById จะไม่ดึง passwordHash
//     return await User.findById(id); 
// };
// exports.findUserByField = async (fieldName, value) => {
//     // 💡 Logic: ค้นหาโดยใช้ Dynamic Field Name
//     return await User.findOne({ [fieldName]: value });
// };

// exports.updateUser = async (id, updates) => {
//     // 💡 Tech Stack: ใช้ findByIdAndUpdate เพื่ออัปเดตและคืนค่า Document ที่อัปเดตแล้ว
//     const updatedUser = await User.findByIdAndUpdate(
//         id,
//         { $set: updates }, // $set เพื่ออัปเดตเฉพาะฟิลด์ที่ส่งมา
//         { new: true, runValidators: true } // new: true เพื่อคืนค่า Document ใหม่
//     );

//     return updatedUser;
// };