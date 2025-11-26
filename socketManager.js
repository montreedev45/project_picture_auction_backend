// socketManager.js

let io; // ตัวแปรนี้จะเก็บ instance ของ Socket.IO

// 1. ฟังก์ชันสำหรับกำหนดค่า io (เรียกเมื่อ server.js ถูกรัน)
const setSocketIO = (socketIOInstance) => {
  io = socketIOInstance;
};

// 2. ฟังก์ชันสำหรับ Broadcast ที่ปลอดภัย
const broadcastNewBid = (productId, updatedProduct, latestHistory) => {
  console.log(updatedProduct);
  // 2. 🛡️ Safety Check: ถ้า io ยังไม่ถูกตั้งค่า ให้ Log Error
  if (!io) {
    console.error("Socket.IO instance not initialized!");
    return;
  }

  const productIdString = String(productId);

  // 🔑 3. ส่ง Event Name ใหม่: "auction_update"
  io.to(String(productId)).emit("auction_update", {
    // 🔑 3. ส่ง Product Object ที่ถูกแปลงและกรองข้อมูลแล้ว
    product: updatedProduct,
    // 🔑 4. ดึง history ออกจาก productData ที่แปลงแล้ว (ถ้าจำเป็นต้องส่งแยก)
    //    แต่แนะนำให้ส่งแค่ product และให้ Frontend ดึง history จาก product.bidHistory
    history: latestHistory || [],
  });

  console.log(
    `📢 Broadcast: Auction updated for product ${productIdString}. Product : ${updatedProduct}`
  );
};

module.exports = {
  setSocketIO,
  broadcastNewBid, // 🔑 Export ฟังก์ชันใหม่
};
