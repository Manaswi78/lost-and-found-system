const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234", // change if needed
    database: "lostfound"
});

db.connect((err) => {
    if (err) {
        console.log("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

module.exports = db;