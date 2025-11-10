import express from "express";
import User from "../models/User.js";
import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➕ Add NT points to a user
router.put("/ntpoints/add", adminProtect, async (req, res) => {
  try {
    const { email, points } = req.body;

    if (!email || !points)
      return res.status(400).json({ message: "Email and points required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Ensure achievements always exists
    if (!user.achievements) {
      user.achievements = {
        points: 0,
        totalReads: 0,
        lastActive: null,
        recent: [],
        readCount: 0,
        level: 1
      };
    }

    // ✅ Add points safely
    user.achievements.points += Number(points);
    user.achievements.lastActive = new Date();

    await user.save();

    return res.json({ 
      message: `✅ ${points} NT added to ${email}`, 
      newPoints: user.achievements.points 
    });
  } catch (err) {
    console.error("Add NT error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

