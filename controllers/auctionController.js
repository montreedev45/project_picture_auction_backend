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

exports.getUsers = async(req, res, next) => {
    try {
        const users = await auctionService.getUsers(); 
        return res.status(200).json({ message: 'Users fetched successfully', users });
        
    } catch (error) {
        return next(error); 
    }
}

exports.getUserById = async(req, res, next) => {
    try {
        const UserId = req.params.id;
        const user = await auctionService.getUserById(UserId); 
        return res.status(200).json({ message: 'User By Id fetched successfully', user });
        
    } catch (error) {
        return next(error); 
    }
}