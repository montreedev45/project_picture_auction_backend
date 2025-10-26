const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
    
    // 1. ⚙️ สร้าง Transporter (การกำหนดค่า SMTP)
    // 💡 หากใช้ Gmail ให้ใช้ SMTP ของ Google (ต้องสร้าง App Password ในบัญชี Google)
    // 💡 Best Practice: ควรใช้ Service เช่น SendGrid, Mailgun เพื่อ Production
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // เช่น 'smtp.gmail.com'
        port: process.env.EMAIL_PORT || 587, // 465 (secure) หรือ 587 (tls)
        secure: process.env.EMAIL_PORT === 465, // ใช้ SSL/TLS หรือไม่
        auth: {
            user: process.env.EMAIL_USERNAME, 
            pass: process.env.EMAIL_PASSWORD, // 🔑 App Password ไม่ใช่รหัสผ่านบัญชีปกติ
        },
        // 💡 ปิดการตรวจสอบ SSL Cert ใน Dev environment (ไม่แนะนำใน Production)
        // tls: {
        //     rejectUnauthorized: false
        // } 
    });

    // 2. 📝 กำหนดรายละเอียดอีเมล
    const mailOptions = {
        from: `Picture_Auction<${process.env.EMAIL_FROM}>`, // 💡 ชื่ออีเมลผู้ส่ง
        to: options.email,
        subject: options.subject,
        html: options.message, // ใช้ html สำหรับ Body ของอีเมล (รองรับลิงก์)
        // text: options.message, // หรือใช้ text ถ้าไม่ต้องการ HTML
    };

    // 3. 🚀 ส่งอีเมล
    await transporter.sendMail(mailOptions);
};