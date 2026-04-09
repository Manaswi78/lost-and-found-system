// backend/utils/notification.js
const nodemailer = require("nodemailer");

// Configure transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "manaswipatil.work@gmail.com",
        pass: "lpwpnrxyljjvzhwy",
    },
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: "manaswipatil.work@gmail.com", // ✅ FIXED (was wrong before)
        to: to,
        subject: subject,
        text: text,
    };

    console.log("📧 Sending email to:", to); // 🔍 debug

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log("❌ Email error:", err);
        } else {
            console.log("✅ Email sent:", info.response);
        }
    });
};

module.exports = { sendEmail };