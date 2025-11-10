// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Admin Login Route
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password required" });

    if (password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.json({ message: "ok", token });
  } catch (err) {
    console.error("❌ Admin login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

