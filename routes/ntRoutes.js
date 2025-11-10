import express from "express";
import User from "../models/User.js";
import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➕ Add NT points
router.put("/ntpoints/add", adminProtect, async (req, res) => {
  try {
    const { email, points } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.achievements) user.achievements = { points: 0 };
    user.achievements.points = (user.achievements.points || 0) + Number(points);
    await user.save();

    res.json({ message: `✅ ${points} NT added to ${email}`, points: user.achievements.points });
  } catch (err) {
    console.error("Add NT error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📋 Get all users
router.get("/ntpoints", adminProtect, async (req, res) => {
  try {
    const users = await User.find({}, "name email achievements.points");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;














