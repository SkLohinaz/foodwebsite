const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const router = express.Router();

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Change if needed
    password: "Lohinaz@123", // Change if needed
    database: "foodordering"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");
});

// Register user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.json({ success: false, message: "Database error" });

        if (result.length > 0) {
            return res.json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword],
            (err) => {
                if (err) {
                    return res.json({ success: false, message: "Error saving user" });
                }
                res.json({ success: true });
            }
        );
    });
});

module.exports = router;
