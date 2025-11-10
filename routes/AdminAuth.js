import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // ✅ Make sure this is imported
import { protect } from "../middleware/authMiddleware.js"; // optional if you need elsewhere

dotenv.config();
const router = express.Router();

// 🧩 Debug log — confirm env var is loaded
if (!process.env.ADMIN_PASSWORD) {
  console.error("❌ ADMIN_PASSWORD not found in environment variables!");
} else {
  console.log("✅ ADMIN_PASSWORD loaded successfully (hidden value)");
}

// ✅ Secure admin login route
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    // 🧠 Check password provided
    if (!password) {
      console.warn("⚠️ No password provided in login request");
      return res.status(400).json({ message: "Password required" });
    }

    // 🔐 Compare with environment password
    if (password === process.env.ADMIN_PASSWORD) {
      console.log("🔐 Admin logged in successfully");

      // 🔑 Generate JWT token for admin
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      // ✅ Send token back
      return res.json({ message: "ok", token });
    }

    console.warn("🚫 Wrong password attempt");
    return res.status(401).json({ message: "Invalid password" });

  } catch (err) {
    console.error("❌ Error during admin login:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
