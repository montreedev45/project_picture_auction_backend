const express = require("express");
const cors = require("cors");
const databaseConnect = require("./config/db");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

const auctionRoutes = require("./routes/auctionRoutes");
const { setSocketIO, broadcastNewBid } = require('./socketManager');
const errorHandler = require("./middlewares/errorHandlerMiddleware");
dotenv.config();

const app = express();
const httpServer = http.createServer(app); // 1. สร้าง HTTP Server
const PORT = process.env.PORT || 5000; // 💡 ใส่ Default Port ไว้เผื่อ

databaseConnect();

// ------------------------------------------------
// SOCKET.IO SETUP
// ------------------------------------------------
const io = new Server(httpServer, {
  // 2. ผูก Socket.IO เข้ากับ httpServer
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ------------------------------------------------
// SOCKET HANDLERS
// ------------------------------------------------
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  socket.on("join_auction", (productId) => {
    socket.join(productId);
    console.log(`User ${socket.id} joined room: ${productId}`);
  });
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ------------------------------------------------
// BROADCAST FUNCTION (ต้องเข้าถึง io ได้)

setSocketIO(io);

// ------------------------------------------------
// MIDDLEWARES AND ROUTES
// ------------------------------------------------
// ⚠️ เนื่องจากคุณตั้งค่า CORS สำหรับ Socket.IO ไปแล้ว
// CORS Middleware สำหรับ Express ก็ยังจำเป็นต้องมี
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const corsOptions = {
  origin: allowedOrigin,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ strict: false, type: "application/json" }));

app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use("/api/auction", auctionRoutes);

app.get("/", (req, res) => {
  res.send(`Auction API is running successfully on port ${PORT}!`);
});


app.use(errorHandler)

// ------------------------------------------------
// 4. SERVER START - ใช้ httpServer.listen() เท่านั้น!
// ------------------------------------------------


httpServer.listen(PORT, () => {
  // 🚨 แก้ไข: ใช้ httpServer แทน app
  console.log(`Server and Socket.IO are running on port ${PORT}`);
});

// ------------------------------------------------
// 5. EXPORT - ต้อง Export broadcastNewBid เพื่อให้ Service Layer เรียกใช้ได้
// ------------------------------------------------
module.exports = { app, broadcastNewBid }; // 💡 ไม่จำเป็นต้อง Export httpServer
