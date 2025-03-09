const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Lohinaz@123",
    database: "foodordering"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to database.");
});

// Register user
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.json({ success: false, message: "Database error" });
        }

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
                    console.error("Error saving user:", err);
                    return res.json({ success: false, message: "Error saving user" });
                }
                res.json({ success: true });
            }
        );
    });
});

// Login user
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.json({ success: false, message: "Database error" });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const user = result[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

// Serve frontend files
app.use(express.static("public"));

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
