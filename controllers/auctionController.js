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

