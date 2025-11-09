import User from "../models/User.js";
import UserEvent from "../models/UserEvent.js";
import mongoose from "mongoose";

export const getAchievements = async (req, res) => {
  try {
    const userId = req.params.id;
    // ensure same user or admin (authMiddleware)
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // times
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1); // week starts Mon
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // aggregate counts by type/date range
    const matchBase = { userId: mongoose.Types.ObjectId(userId) };

    const [totalReads, monthReads, weekReads, todayReads, points, lastActive, recent] = await Promise.all([
      UserEvent.countDocuments({ ...matchBase, type: "read" }),
      UserEvent.countDocuments({ ...matchBase, type: "read", createdAt: { $gte: startOfMonth } }),
      UserEvent.countDocuments({ ...matchBase, type: "read", createdAt: { $gte: startOfWeek } }),
      UserEvent.countDocuments({ ...matchBase, type: "read", createdAt: { $gte: startOfToday } }),
      (async() => {
        const user = await User.findById(userId).select("points");
        return user ? user.points : 0;
      })(),
      (async() => {
        const user = await User.findById(userId).select("lastActive");
        return user ? user.lastActive : null;
      })(),
      UserEvent.find({ userId: mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(20)
    ]);

    // compute level from points or totalReads; choose one
    const level = computeLevel(totalReads);

    res.json({
      totalReads, monthReads, weekReads, todayReads,
      points, lastActive, recent, level
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

function computeLevel(totalReads){
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
