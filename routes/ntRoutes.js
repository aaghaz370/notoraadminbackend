import express from "express";
import User from "../models/User.js";
import UserEvent from "../models/UserEvent.js"; // <-- make sure this is imported
import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.put("/ntpoints/add", adminProtect, async (req, res) => {
  try {
    const { email, points } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const addPoints = Number(points);

    // ✅ Ensure structure exists
    if (!user.achievements) user.achievements = { points: 0 };

    // ✅ Update points
    user.achievements.points = (user.achievements.points || 0) + addPoints;
    user.points = (user.points || 0) + addPoints;
    user.lastActive = new Date();
    await user.save();

    // ✅ Log admin action as event (visible in Recent Activity)
    await UserEvent.create({
      userId: user._id,
      type: "admin_bonus",  // ✅ new event type
      description: `Admin granted +${addPoints}NT`,
      points: addPoints,
      createdAt: new Date(),
    });

    res.json({
      message: `✅ ${points} NT added to ${email}`,
      points: user.points,
      achievementsPoints: user.achievements.points,
    });
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


