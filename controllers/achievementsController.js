import mongoose from "mongoose";
import User from "../models/User.js";
import UserEvent from "../models/UserEvent.js";

export const getAchievements = async (req, res) => {
  try {
    const userId = req.params.id?.trim();

    // 🧠 Validate ObjectId first
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Prepare dates
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const matchBase = { userId: new mongoose.Types.ObjectId(userId) };

    const [totalReads, monthReads, weekReads, todayReads, userData, recent] = await Promise.all([
      UserEvent.countDocuments({ ...matchBase, type: "read" }),
      UserEvent.countDocuments({ ...matchBase, type: "read", createdAt: { $gte: startOfMonth } }),
      UserEvent.countDocuments({ ...matchBase, type: "read", createdAt: { $gte: startOfWeek } }),
      UserEvent.countDocuments({ ...matchBase, type: "read", createdAt: { $gte: startOfToday } }),
      User.findById(userId).select("points lastActive"),
      UserEvent.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    const points = userData?.points || 0;
    const lastActive = userData?.lastActive || null;
    const level = computeLevel(totalReads);

    res.json({
      totalReads,
      monthReads,
      weekReads,
      todayReads,
      points,
      lastActive,
      recent,
      level,
    });
  } catch (err) {
    console.error("Achievements error:", err);
    res.status(500).json({ message: "Server error while fetching achievements" });
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

