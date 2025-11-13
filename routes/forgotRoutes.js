import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* ================================
   1️⃣ Request Reset Link
================================= */
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: "If email exists, link generated" });

    // 🔹 generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min validity
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}&email=${email}`;
    console.log("🔗 Reset link:", resetLink);

    return res.json({
      message: "Reset link generated successfully",
      link: resetLink,
    });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   2️⃣ Reset Password (with token + email)
================================= */
router.post("/reset", async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 🔹 Find correct user (token + email + expiry valid)
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token" });

    // 🔹 Set new password safely
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login again." });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

