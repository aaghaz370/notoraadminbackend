import express from "express";
import Donation from "../models/Donation.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { protect, adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📩 User donates a book
router.post("/", protect, async (req, res) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      email: req.user.email,
      status: "pending",
    });
    res.json(donation);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error submitting donation" });
  }
});


// 🧾 Get single donation by ID (for editing)
router.get("/:id", adminProtect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json(donation);
  } catch (err) {
    console.error("❌ Fetch single donation error:", err);
    res.status(500).json({ message: "Error fetching donation details" });
  }
});


// 📥 Admin gets all donations
router.get("/", adminProtect, async (req, res) => {
  const donations = await Donation.find().sort({ createdAt: -1 });
  res.json(donations);
});

// ✏️ Edit donation details (before approval)
router.put("/:id", adminProtect, async (req, res) => {
  try {
    const { name, author, genre, rating, pdfUrl, thumbnail } = req.body;
    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        name,
        author,
        genre,
        rating,
        pdfUrl,
        thumbnail,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Donation not found" });
    res.json({ message: "Donation updated successfully", updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error updating donation" });
  }
});

// ✅ Approve donation (adds to Books + gives 5NT)
router.put("/:id/approve", adminProtect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // move to Books collection
    const book = await Book.create({
      name: donation.name,
      author: donation.author,
      genre: donation.genre,
      rating: donation.rating,
      thumbnail: donation.thumbnail,
      pdfUrl: donation.pdfUrl,
    });

    // reward user (+5 NT safely)
    // const user = await User.findOne({ email: donation.email });
    // reward user (+5 NT safely)
const user = await User.findOne({
  $or: [
    { email: donation.email },
    { email: donation.userEmail }
  ]
});

    if (user) {
      if (!user.achievements) user.achievements = {};
      user.achievements.points = (user.achievements.points || 0) + 5;
      user.achievements.lastActive = new Date();
      await user.save();
      console.log(`✅ ${user.email} rewarded +5NT`);
    }

    await donation.deleteOne();
    res.json({ message: "Donation approved & user rewarded", book });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error approving donation" });
  }
});

// ❌ Reject donation
router.delete("/:id", adminProtect, async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation rejected and deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error deleting donation" });
  }
});

export default router;
