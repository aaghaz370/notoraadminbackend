import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";
import nodemailer from "nodemailer";
import crypto from "crypto";








const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
// Update user name or password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);




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




router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If email exists, link sent" }); // security reason

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1000 * 60 * 15; // 15 minutes
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Notora Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - Notora",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "Reset email sent successfully!" });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Failed to send reset link" });
  }
});

export default router;

