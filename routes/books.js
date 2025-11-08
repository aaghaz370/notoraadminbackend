import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

/* ============================
   ✅ GET ALL BOOKS (LATEST FIRST)
=============================== */
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error.message);
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});

/* ============================
   ✅ ADD NEW BOOK
=============================== */
router.post("/", async (req, res) => {
  console.log("📩 POST /api/books hit hua!");
  console.log("📦 Received Body:", req.body);

  try {
    const { name, author, genre, rating, thumbnail, pdfUrl } = req.body;

    // 🔒 Validation
    if (!name?.trim() || !author?.trim() || !genre?.trim()) {
      return res.status(400).json({
        message: "❌ Name, author, and genre are required fields.",
      });
    }

    // 🧮 Ensure valid rating
    const safeRating =
      typeof rating === "number" && rating >= 1 && rating <= 5 ? rating : 1;

    // 🆕 Create and save new book
    const newBook = new Book({
      name: name.trim(),
      author: author.trim(),
      genre: genre.trim(),
      rating: safeRating,
      thumbnail: thumbnail?.trim() || "",
      pdfUrl: pdfUrl?.trim() || "",
    });

    await newBook.save();

    console.log("✅ Book added successfully:", newBook.name);
    res.status(201).json({
      message: "✅ Book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("❌ Error adding book:", error.message);
    res.status(500).json({ message: "Failed to add book", error: error.message });
  }
});

/* ============================
   ✅ UPDATE BOOK
=============================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rating } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });

    res.status(200).json({
      message: "✅ Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("❌ Error updating book:", error.message);
    res.status(500).json({ message: "Failed to update book", error: error.message });
  }
});

/* ============================
   ✅ DELETE BOOK
=============================== */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ message: "✅ Book deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error.message);
    res.status(500).json({ message: "Failed to delete book", error: error.message });
  }
});

export default router;





// ✅ Increment view count when book opened
router.post("/:id/view", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.views = (book.views || 0) + 1;
    await book.save();

    res.json({ success: true, views: book.views });
  } catch (err) {
    console.error("View count error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
