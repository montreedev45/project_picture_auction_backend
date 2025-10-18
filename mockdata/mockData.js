const initialProducts = [
    { id: 1, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'upcoming...', isLiked: false, imageUrl: 'view1' },
    { id: 2, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'upcoming...', isLiked: false, imageUrl: 'view1' },
    { id: 3, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'upcoming...', isLiked: false, imageUrl: 'view1' },
    { id: 4, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'upcoming...', isLiked: false, imageUrl: 'view2' },
    { id: 5, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'upcoming...', isLiked: false, imageUrl: 'view2' },
    { id: 6, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'upcoming...', isLiked: false, imageUrl: 'view2' },
    
    { id: 7, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'sold for 500$', isLiked: false, imageUrl: 'view2' },
    { id: 8, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'sold for 500$', isLiked: false, imageUrl: 'view2' },
    { id: 9, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'sold for 500$', isLiked: false, imageUrl: 'view2' },
    { id: 10, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'sold for 500$', isLiked: false, imageUrl: 'view2' },
    { id: 11, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'sold for 500$', isLiked: false, imageUrl: 'view2' },
    { id: 12, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'sold for 500$', isLiked: false, imageUrl: 'view2' },

    { id: 13, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'processing', isLiked: true, imageUrl: 'view1' },
    { id: 14, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'processing', isLiked: true, imageUrl: 'view1' },
    { id: 15, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'processing', isLiked: true, imageUrl: 'view1' },

    { id: 16, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'rebid now', isLiked: true, imageUrl: 'view2' },
    { id: 17, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'rebid now', isLiked: true, imageUrl: 'view2' },
    { id: 18, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'rebid now', isLiked: true, imageUrl: 'view2' },

    { id: 19, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'paid', isLiked: false, imageUrl: 'view2' },
    { id: 20, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'paid', isLiked: false, imageUrl: 'view2' },
    { id: 21, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'paid', isLiked: false, imageUrl: 'view2' },
    { id: 22, title: "the forest of par", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "100$", time: "02:00", status: 'paid', isLiked: false, imageUrl: 'view2' },
    { id: 23, title: "Desert Sunset", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "250$", time: "01:30", status: 'paid', isLiked: false, imageUrl: 'view2' },
    { id: 24, title: "Abstract Serenity", des: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s', price: "80$", time: "03:45", status: 'paid', isLiked: false, imageUrl: 'view2' },
];



const initialUsers = [
    { id: 1, username: "user1", password: "1234", firstname: "montree", lastname: "chanuanklang", email: "test@gmail.com", phone: "0123456789", address: "mukdahan"},
    { id: 2, username: "user2", password: "1234", firstname: "jirawan", lastname: "pangpun", email: "test@gmail.com", phone: "0123456789", address: "mukdahan"},
];


exports.getAllProductsFromDB = async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); 
    return initialProducts;
};

exports.getAllUsersFromDB = async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); 
    return initialUsers;
};