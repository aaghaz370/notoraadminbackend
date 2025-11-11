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




// ==========================
// 🧠 SECURE FORGOT + RESET PASSWORD
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If email exists, reset link sent" }); // security reason

    // ✅ create token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

    // ✅ Stable Gmail SMTP Config
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `Notora Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - Notora",
      html: `
        <div style="font-family:Poppins,sans-serif;line-height:1.6;">
          <h2 style="color:#e50914;">Reset Your Notora Password</h2>
          <p>Hi ${user.name || "reader"},</p>
          <p>Click the button below to reset your password. The link will expire in <b>15 minutes</b>.</p>
          <a href="${resetLink}" 
             style="background:#e50914;color:white;text-decoration:none;padding:10px 18px;border-radius:6px;display:inline-block;">Reset Password</a>
          <p>If you didn’t request this, ignore this email.</p>
          <p style="margin-top:25px;color:#666;">– The Notora Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset link sent to ${email}`);
    return res.json({ message: "Reset email sent successfully!" });
  } catch (err) {
    console.error("❌ Forgot-password error:", err);
    return res.status(500).json({ message: "Server error while sending reset link" });
  }
});

// ==========================
// 🔒 RESET PASSWORD
// ==========================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "Missing token or password" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("❌ Reset-password error:", err);
    return res.status(500).json({ message: "Server error while resetting password" });
  }
});


export default router;

