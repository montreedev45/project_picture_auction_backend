// Hash password
const mockHashPassword = (password) => `Hashed_${password}_ABC`;

let initialUsers = [
    { id: 1, username: "user1", passwordHash: mockHashPassword("ae1234"), firstname: "montree", lastname: "chanuanklang", email: "test@gmail.com", phone: "0123456789", address: "mukdahan", createdAt: new Date().toISOString()},
    { id: 2, username: "user2", passwordHash: mockHashPassword("earn1234"), firstname: "jirawan", lastname: "pangpun", email: "test@gmail.com", phone: "0123456789", address: "mukdahan", createdAt: new Date().toISOString()},
];

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
exports.saveNewUser = async ({ username, email, password, firstname, lastname, phone, address }) => {

    const newId = getNextUserId(); 
    const passwordHash = mockHashPassword(password);
    const createdAt = new Date().toISOString(); // time stamp date (string)

    const newUser = {
        id: newId,
        username,
        email,
        passwordHash, // already Hash password
        firstname,
        lastname,
        phone,
        address,
        createdAt,
    };

    initialUsers.push(newUser); // add new user in initialUsers

    return newUser;
};

exports.initialUsers = initialUsers; // Export array นี้เพื่อใช้ในการ Test/Debug