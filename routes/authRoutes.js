import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

import nodemailer from "nodemailer";
import crypto from "crypto";




import { Resend } from "resend";








const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
// Update user name or password



// ✏️ UPDATE NAME OR PASSWORD
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, password } = req.body;

    // ✅ Prevent duplicate username (if changing)
if (name && name !== req.user.name) {
  const nameExists = await User.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (nameExists) {
    return res.status(400).json({ message: "Username already taken" });
  }
}


    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});













export default router;

