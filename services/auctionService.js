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