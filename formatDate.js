
const transformDateToPeriod = (dateString) => {
  const date = new Date(dateString);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const month = monthNames[date.getUTCMonth()];
  const dayOfMonth = date.getUTCDate();
  
  // คำนวณวันแรกของเดือนเพื่อหา offset ของวันในสัปดาห์
  const firstDayOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).getUTCDay();
  const week = Math.ceil((dayOfMonth + firstDayOfMonth) / 7);

  // Business Logic: จำกัดไว้ที่ W4 เพื่อความสวยงามของ Dashboard (หรือปรับตามความเหมาะสม)
  const weekLabel = week > 4 ? "W4" : `W${week}`;
  return { month, week: weekLabel };
};

/**
 * ฟังก์ชันหลักในการเตรียมข้อมูล (Normalize Data)
 * รับข้อมูลจาก Database แล้วเติม 0 ในส่วนที่ขาดหาย (Zero-filling)
 */
const prepareDashboardData = (rawDatabaseRecords = []) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weeks = ["W1", "W2", "W3", "W4"];

  // 1. สร้าง Template โดยใช้ Map เพื่อประสิทธิภาพในการเข้าถึงข้อมูล (O(1) Access)
  const templateMap = new Map();
  
  monthNames.forEach(m => {
    weeks.forEach(w => {
      const key = `${m}-${w}`;
      templateMap.set(key, { month: m, week: w, price: 0 });
    });
  });

  // 2. Aggregate ข้อมูลจาก Database (O(n) Complexity)
  rawDatabaseRecords.forEach(record => {
    if (!record.updatedAt) return; // Defensive: ป้องกัน record ที่ไม่มีวันที่

    const { month, week } = transformDateToPeriod(record.updatedAt);
    const key = `${month}-${week}`;
    
    if (templateMap.has(key)) {
      const existing = templateMap.get(key);
      templateMap.set(key, { 
        ...existing, 
        price: existing.price + (record.pro_price || 0) 
      });
    }
  });

  // 3. แปลง Map กลับเป็น Array (เพื่อให้ง่ายต่อการนำไปใส่ Chart ใน Frontend)
  const finalData = Array.from(templateMap.values());
  
  return finalData;
};

module.exports = { prepareDashboardData };