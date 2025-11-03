const auctionService = require('../services/auctionService');

exports.getProducts = async(req, res, next) => {
    try {
        const products = await auctionService.getProducts(); 
        return res.status(200).json({ message: 'Products fetched successfully', products });
        
    } catch (error) {
        return next(error); 
    }
}

exports.getProductById = async(req, res, next) => {
    try {
        const ProductId = req.params.id;
        const product = await auctionService.getProductById(ProductId); 
        return res.status(200).json({ message: 'Product By Id fetched successfully', product });
        
    } catch (error) {
        return next(error); 
    }
}

exports.toggleLikeProduct = async (req, res, next) => {
    // 1. 🔑 FIX: ดึง Parameter จาก req.params
    const userId = req.user.id;
    const productsId = parseInt(req.params.productId); // ✅ แก้ไขตรงนี้
    try {
        const result = await auctionService.toggleLike(productsId, userId);

        if (result.action === 'liked') {
            // ✅ FIX: ส่ง 200 OK พร้อม JSON Body
            return res.status(200).json({ 
                message: 'Product liked successfully',
                likeCount: result.likeCount
            });
        } else {
            return res.status(200).json({
                message: 'Product unliked successfully', // 💡 แก้ไข spelling
                likeCount: result.likeCount // 💡 แก้ไขชื่อ field
            });
        }
    } catch (error) {
        return next(error);
    }
};