import User from "../models/User.js";
import UserEvent from "../models/UserEvent.js";
import Book from "../models/Book.js";

export const recordEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, bookId } = req.body;
    if (!["read","share","donate"].includes(type)) return res.status(400).json({ message: "Invalid event" });

    // Basic validation: if bookId provided, check exists
    if (bookId) {
      const bookExists = await Book.findById(bookId);
      if (!bookExists) return res.status(400).json({ message: "Book not found" });
    }

    // Anti-cheat: simple checks
    // 1) Prevent duplicate "read" for same book in last 5 minutes
    if (type === "read") {
      const recent = await UserEvent.findOne({
        userId, type: "read", bookId,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });
      if (recent) return res.status(409).json({ message: "Read recorded recently" });
    }

    // 2) Save event
    const ev = await UserEvent.create({
      userId, type, bookId,
      ip: req.ip, ua: req.get("User-Agent")
    });

    // 3) Update user points and lastActive and book.views if needed
    const user = await User.findById(userId);
    let add = 0;
    if (type === "read") add = 1;
    if (type === "share") add = 2;
    if (type === "donate") add = 5;
    user.points = (user.points || 0) + add;
    user.lastActive = new Date();
    await user.save();

    // 4) optionally update Book.views
    if (type === "read" && bookId) {
      await Book.findByIdAndUpdate(bookId, { $inc: { views: 1 }});
    }

    res.json({ success: true, event: ev, points: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
