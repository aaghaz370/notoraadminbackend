import User from "../models/User.js";
import UserEvent from "../models/UserEvent.js";
import Book from "../models/Book.js";

export const recordEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, bookId } = req.body;

    if (!["read", "share", "donate"].includes(type))
      return res.status(400).json({ message: "Invalid event type" });

    // Optional: validate bookId
    if (bookId) {
      const bookExists = await Book.findById(bookId);
      if (!bookExists)
        return res.status(404).json({ message: "Book not found" });
    }

    // Anti-cheat: prevent duplicate "read" in 5 min
    if (type === "read") {
      const recent = await UserEvent.findOne({
        userId,
        type: "read",
        bookId,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      });
      if (recent)
        return res.status(409).json({ message: "Already recorded recently" });
    }

    // Create event
    const ev = await UserEvent.create({
      userId,
      type,
      bookId,
      ip: req.ip,
      ua: req.get("User-Agent"),
    });

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add points
    let add = 0;
    if (type === "read") add = 1;
    if (type === "share") add = 2;
    if (type === "donate") add = 5;

    user.points = (user.points || 0) + add;
    user.lastActive = new Date();

    // Increment read count
    if (type === "read") user.achievements.readCount += 1;

    // Update Book views
    if (type === "read" && bookId) {
      await Book.findByIdAndUpdate(bookId, { $inc: { views: 1 } });
    }

    await user.save();

    console.log("✅ Event recorded for user:", user.email, "→", user.points, "points");

    res.json({
      success: true,
      event: ev,
      points: user.points,
      lastActive: user.lastActive,
    });
  } catch (err) {
    console.error("❌ Event record error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

