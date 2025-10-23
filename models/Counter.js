const mongoose = require("mongoose");

// Counter Schema สำหรับเก็บเลขลำดับถัดไปของแต่ละ Collection
const counterSchema = new mongoose.Schema({
    // 💡 Business Logic: field ที่จะเก็บชื่อ Model ที่เราต้องการนับ
    _id: { 
        type: String, 
        required: true 
    }, 
    // 🔑 Tech Stack: field สำหรับเก็บค่าล่าสุด
    sequence_value: { 
        type: Number, 
        default: 0 
    }
});

module.exports = mongoose.model("Counter", counterSchema);
