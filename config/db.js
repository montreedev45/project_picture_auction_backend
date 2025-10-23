const mongoose = require('mongoose');

const databaseConnect = async() => {

    const url = process.env.CONNECTION_STRING;
    
    if (!url) {
        console.error("Error: CONNECTION_STRING is not defined in environment variables.");
        process.exit(1); 
    }
    
    try {
        const conn = await mongoose.connect(url);
        console.log(`Database Connect Successfuly: ${conn.connection.host} 🚀`);
        console.log(`Connected to DB: ${conn.connection.name}`);

    } catch (error) {
        console.error('Database Connect Fail:', error.message);
        process.exit(1);
    }
}

module.exports = databaseConnect;