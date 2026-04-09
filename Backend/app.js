const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/items", itemRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Server working 🚀");
});

// Start server (ALWAYS LAST)
app.listen(5000, () => {
    console.log("🔥 Server running on port 5000");
});