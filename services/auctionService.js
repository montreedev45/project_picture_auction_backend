const { getAllProductsFromDB, getAllUsersFromDB } = require('../mockdata/mockData');

exports.getProducts = async () => {

    const rawProducts = await getAllProductsFromDB(); 

    const processedProducts = rawProducts.map(product => {
        
        const imageUrl = product.imageUrl && product.imageUrl !== '' 
            ? `/assets/images/${product.imageUrl}.jpg` 
            : 'https://placehold.co/300x300/808080/ffffff?text=No+Image';

        return {
            id: product.id,
            title: product.title,
            description: product.des,
            currentPrice: product.price,
            timeRemaining: product.time, 
            statusLabel: product.status,
            isLiked: product.isLiked,
            imageUrl: imageUrl,
        };
    });

    return processedProducts;
};


exports.getProductById = async (ProductId) => {

    const rawProducts = await getAllProductsFromDB(); 

    const product = rawProducts.find(p => p.id === parseInt(ProductId));

    if (!product) {
        // 🛑 Best Practice: โยน Error ที่มี Status Code ชัดเจน
        const error = new Error(`Product with ID ${ProductId} not found.`);
        error.statusCode = 404; // HTTP Not Found
        throw error;
    }

    const isClosed = product.time === "00:00"; // ตัวอย่าง logic การคำนวณสถานะ
    
    const imageUrl = product.imageUrl && product.imageUrl !== '' 
        ? `/assets/images/${product.imageUrl}.jpg` 
        : 'https://placehold.co/300x300/808080/ffffff?text=No+Image';

    const processedProduct = {
        id: product.id,
        title: product.title,
        description: product.des, 
        currentPrice: product.price, 
        timeRemaining: product.time, 
        statusLabel: isClosed ? 'Closed' : product.status,
        isLiked: product.isLiked,
        imageUrl: imageUrl,
    };
    return processedProduct;

};


exports.getUsers = async () => {

    const rawUsers = await getAllUsersFromDB(); 

    const processedUsers = rawUsers.map(user => {
        
        return {
            id: user.id,
            username: user.username,
            password: user.password,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            address: user.address
        };
    });

    return processedUsers;
};

exports.getUserById = async (UserId) => {

    const rawUsers = await getAllUsersFromDB(); 

    const user = rawUsers.find(p => p.id === parseInt(UserId));

    if (!user) {
        // 🛑 Best Practice: โยน Error ที่มี Status Code ชัดเจน
        const error = new Error(`User with ID ${UserId} not found.`);
        error.statusCode = 404; // HTTP Not Found
        throw error;
    }

    const processedUser = {
        id: user.id,
        username: user.username,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        address: user.address
    };
    return processedUser;

};