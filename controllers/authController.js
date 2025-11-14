import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

// =========================
//  📧 INIT RESEND CLIENT
// =========================
const resend = new Resend(process.env.RESEND_API_KEY);

// =========================
//  🔑 GENERATE JWT
// =========================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// =========================
//  👤 REGISTER USER
// =========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // Check email
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Check username
    const nameExists = await User.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (nameExists)
      return res.status(400).json({ message: "Username already taken" });

    const user = await User.create({ name, email, password });

    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =========================
//  🔐 LOGIN USER
// =========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =========================
//  👤 PROFILE
// =========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =============================
//  🔥 SECURE FORGOT PASSWORD
// =============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: "If email exists, link sent" });

    // Create token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 1000 * 60 * 10; // 10 min
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;

    // Send email using RESEND
    await resend.emails.send({
      from: "Notora <no-reply@notora.site>",
      to: user.email,
      subject: "Reset Your Notora Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to reset your password. This link expires in <b>10 minutes</b>.</p>
        <a href="${resetURL}" style="
          background:#e50914;
          color:white;
          padding:12px 18px;
          border-radius:6px;
          text-decoration:none;
        ">Reset Password</a>
        <p>If this wasn't you, safely ignore this email.</p>
      `,
    });

    return res.json({ message: "Reset link sent to email." });
  } catch (err) {
    console.log("Forgot password error:", err);
    return res.status(500).json({ message: "Error sending email" });
  }
};

// =============================
//  🔐 RESET PASSWORD
// =============================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ message: "Missing token or password" });

    // Hash incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Update password
    user.password = password; // pre-save hook will hash automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.log("Reset password error:", err);
    return res.status(500).json({ message: "Error resetting password" });
  }
};




