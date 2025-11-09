import express from "express";
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

// 🧩 Debug log — confirm env var is loaded
if (!process.env.ADMIN_PASSWORD) {
  console.error("❌ ADMIN_PASSWORD not found in environment variables!");
} else {
  console.log("✅ ADMIN_PASSWORD loaded successfully (hidden value)");
}

// ✅ Secure admin login route
router.post("/login", (req, res) => {
  try {
    const { password } = req.body;

    // if body not sent properly
    if (!password) {
      console.warn("⚠️ No password provided in login request");
      return res.status(400).json({ message: "Password required" });
    }

    // compare with env var
    if (password === process.env.ADMIN_PASSWORD) {
      console.log("🔐 Admin logged in successfully");
      return res.json({ message: "ok" });
    }

    console.warn("🚫 Wrong password attempt");
    return res.status(401).json({ message: "Invalid password" });
  } catch (err) {
    console.error("❌ Error during login:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
