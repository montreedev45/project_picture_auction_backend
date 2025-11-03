const Product = require("../models/Product");

exports.getProducts = async () => {
   return await Product.find();
};

exports.getProductById = async (ProductId) => {
    
    const queryId = Number(ProductId); 
    
    const product = await Product.findOne({ pro_id: queryId }); 
    
    if (!product) {
        // 💡 Best Practice: โยน Error ที่มี Status Code 404
        const error = new Error(`Product with ID ${ProductId} not found.`);
        error.statusCode = 404; // HTTP Not Found
        throw error; 
    }

    return product;
};

exports.toggleLike = async (productId, userId) => {
    // 1. ค้นหาเพื่อตรวจสอบการมีอยู่และสถานะ Like ปัจจุบัน
    const product = await Product.findOne({pro_id: productId}).select('likes');

    if (!product) {
        throw new Error('Products not found');
    }

    const hasLiked = product.likes.includes(userId);
    let updateOperation;
    let action; // 💡 ตัวแปร action ถูกประกาศแล้ว

    if (hasLiked) {
        // 2. 🔑 Logic: UNLIKE (ดึงออกและลดจำนวน)
        updateOperation = {
            $pull: { likes: userId },
            $inc: { pro_likecount: -1 }
        };
        action = 'unliked'; // ✅ แก้ไข Syntax
    } else {
        // 3. 🔑 Logic: LIKE (เพิ่มเข้าและเพิ่มจำนวน)
        updateOperation = {
            $addToSet: { likes: userId },
            $inc: { pro_likecount: 1 } // ✅ แก้ไข: ต้องเป็น +1
        };
        action = 'liked'; // ✅ แก้ไข Syntax
    }

    // 4. Mongoose: ทำการอัปเดต Atomic
    // ✅ FIX: ใช้ updateOperation เป็น Argument ตัวที่ 2
    const updatedProducts = await Product.findOneAndUpdate(
        { pro_id: productId }, // 💡 ใช้ Object query เพื่อความชัดเจน
        updateOperation,
        { new: true } // คืนค่า Document ที่อัปเดตแล้ว
    );

    console.log('action : ',action)
    console.log('pro_likecount : ',updatedProducts.pro_likecount)
    console.log('pro_id : ',updatedProducts.pro_id)
    // 5. คืนค่ากลับไปยัง Controller
    return {
        action: action,
        likeCount: updatedProducts.pro_likecount
    };
};