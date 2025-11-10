// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Secure Admin Login
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ message: "ok", token });
  } catch (err) {
    console.error("❌ Admin Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
