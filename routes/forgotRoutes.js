// routes/forgotRoutes.js
import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/**
 * STEP 1: Request Reset (user enters email)
 * Instead of sending email, show secure link directly.
 */
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If account exists, link shown" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;
    console.log(`🔗 Reset link for ${email}: ${resetLink}`);

    res.json({
      message: "Password reset link generated successfully",
      link: resetLink,
    });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * STEP 2: Verify & Reset Password
 */
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "Missing token or password" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
