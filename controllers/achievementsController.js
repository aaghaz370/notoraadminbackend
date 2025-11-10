import User from "../models/User.js";
import UserEvent from "../models/UserEvent.js";
import mongoose from "mongoose";

export const getAchievements = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only allow same user or admin
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const base = { userId: new mongoose.Types.ObjectId(userId) };

    // Parallel DB queries for speed
    const [totalReads, monthReads, weekReads, todayReads, userData, recent] =
      await Promise.all([
        UserEvent.countDocuments({ ...base, type: "read" }),
        UserEvent.countDocuments({ ...base, type: "read", createdAt: { $gte: startOfMonth } }),
        UserEvent.countDocuments({ ...base, type: "read", createdAt: { $gte: startOfWeek } }),
        UserEvent.countDocuments({ ...base, type: "read", createdAt: { $gte: startOfToday } }),
        User.findById(userId).select("points lastActive achievements.readCount achievements.level"),
        
        UserEvent.find(base).sort({ createdAt: -1 }).limit(20),
      ]);

    if (!userData) return res.status(404).json({ message: "User not found" });

    const level = computeLevel(totalReads);

    res.json({
      totalReads,
      monthReads,
      weekReads,
      todayReads,
      points: userData.points || 0,
      

      lastActive: userData.lastActive || null,
      level,
      recent,
    });
  } catch (err) {
    console.error("❌ Achievements fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

function computeLevel(totalReads) {
  if (totalReads >= 500) return 8;
  if (totalReads >= 400) return 7;
  if (totalReads >= 300) return 6;
  if (totalReads >= 150) return 5;
  if (totalReads >= 80) return 4;
  if (totalReads >= 50) return 3;
  if (totalReads >= 15) return 2;
  if (totalReads >= 5) return 1;
  return 0;
}




