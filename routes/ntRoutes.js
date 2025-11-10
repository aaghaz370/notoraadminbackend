import express from "express";
import User from "../models/User.js";
import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📈 Get all users + their NT
router.get("/ntpoints", adminProtect, async (req, res) => {
  const users = await User.find({}, "name email achievements.points").sort({ "achievements.points": -1 });
  res.json(users);
});

// ➕ Add NT points to a user
router.put("/ntpoints/add", adminProtect, async (req, res) => {
  try {
    const { email, points } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.achievements) user.achievements = {};
    user.achievements.points = (user.achievements.points || 0) + Number(points);
    user.achievements.lastActive = new Date();
    await user.save();

    res.json({ message: `✅ ${points} NT added to ${email}`, user });
  } catch (err) {
    console.error("Add NT error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
