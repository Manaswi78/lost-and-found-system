const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all users
router.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("Error fetching users");
        res.json(results);
    });
});

// GET all lost & found items
router.get("/items", (req, res) => {
    const sql = "SELECT * FROM lost_items UNION SELECT * FROM found_items";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("Error fetching items");
        res.json(results);
    });
});

// APPROVE/REJECT lost item
router.put("/lost/:id/:action", (req, res) => {
    const { id, action } = req.params; // action = approve / reject
    const status = action === "approve" ? "approved" : "rejected";

    const sql = "UPDATE lost_items SET status1 = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).send("Error updating lost item");
        res.send(`Lost item ${status} ✅`);
    });
});

// APPROVE/REJECT found item
router.put("/found/:id/:action", (req, res) => {
    const { id, action } = req.params;
    const status = action === "approve" ? "approved" : "rejected";

    const sql = "UPDATE found_items SET status2 = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).send("Error updating found item");
        res.send(`Found item ${status} ✅`);
    });
});

module.exports = router;