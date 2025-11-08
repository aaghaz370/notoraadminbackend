import express from "express";
import Bookmark from "../models/bookmarkModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all bookmarks for logged user
router.get("/", protect, async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id }).populate("bookId");
  res.json(bookmarks);
});

// Add new bookmark
router.post("/", protect, async (req, res) => {
  const { bookId } = req.body;
  const exists = await Bookmark.findOne({ user: req.user._id, bookId });
  if (exists) return res.status(400).json({ message: "Already bookmarked" });
  const bookmark = await Bookmark.create({ user: req.user._id, bookId });
  res.status(201).json(bookmark);
});

// Delete bookmark
router.delete("/:id", protect, async (req, res) => {
  await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Deleted" });
});

export default router;
