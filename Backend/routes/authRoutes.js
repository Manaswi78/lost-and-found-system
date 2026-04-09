const express = require("express");
const router = express.Router();
const db = require("../config/db");

// REGISTER USER
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    console.log("📥 Data received:", req.body);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            console.log("❌ ERROR:", err);
            return res.status(500).send(err.message);
        }

        console.log("✅ Insert Result:", result);

        // 🔥 ADD THIS DEBUG SAFELY
        db.query("SELECT DATABASE() as db", (err2, result2) => {
            if (!err2) {
                console.log("🧠 Node using DB:", result2);
            }
        });

        res.send("User registered successfully ✅");
    });
});

module.exports = router;


// LOGIN USER
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("📥 Incoming:", email, password);

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.log("❌ DB Error:", err);
            return res.status(500).send("Error");
        }

        console.log("📦 DB Results:", results);

        if (results.length === 0) {
            console.log("❌ No user found");
            return res.json({ message: "User not found" });
        }

        const user = results[0];

        console.log("🔐 DB password:", user.password, typeof user.password);
        console.log("🔑 Entered password:", password, typeof password);

        if (String(user.password) === String(password)) {
            console.log("✅ Password match");
            res.json({ user });
        } else {
            console.log("❌ Password mismatch");
            res.json({ message: "Wrong password" });
        }
    });
});