import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";


// 🧠 Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // const existingUser = await User.findOne({ email });
    // if (existingUser) return res.status(400).json({ message: "Email already registered" });
// 🧠 Check if email already registered
const existingUser = await User.findOne({ email });
if (existingUser) return res.status(400).json({ message: "Email already registered" });

// ✅ Check for existing username (case-insensitive)
const nameExists = await User.findOne({
  name: { $regex: new RegExp(`^${name}$`, "i") },
});
if (nameExists)
  return res.status(400).json({ message: "Username already taken, try another" });


    
    const user = await User.create({ name, email, password });

    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Protected profile route
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// ===============================
// 🔹 Forgot Password Controller
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "No account found with that email." });

    // 🔐 Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    // ✅ Temporarily store token in DB (non-permanent fields)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = tokenExpire;
    await user.save({ validateBeforeSave: false });

    // 📧 Email setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetURL = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your Notora password. Click below to proceed:</p>
      <a href="${resetURL}" target="_blank">${resetURL}</a>
      <p>This link will expire in 15 minutes. If this wasn’t you, please ignore it.</p>
    `;

    await transporter.sendMail({
      from: `"Notora Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset - Notora",
      html: message,
    });

    res.json({ message: "Reset link sent successfully to your email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 🔹 Reset Password Controller
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // ✅ Update password safely
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
