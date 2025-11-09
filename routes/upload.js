import express from "express";
import Book from "../models/Book.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Bulk upload route
router.post("/", async (req, res) => {
  try {
    const books = req.body;

    if (!Array.isArray(books)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array." });
    }

    // Validate each book object
    for (const book of books) {
      if (!book.name || !book.author || !book.genre) {
        return res.status(400).json({ message: "Each book must have name, author, and genre." });
      }
    }

    // ✅ Insert all books
    const result = await Book.insertMany(books);
    res.status(201).json({ message: `✅ ${result.length} books added successfully!` });
  } catch (error) {
    console.error("❌ Error during bulk upload:", error);
    res.status(500).json({ message: "Bulk upload failed", error });
  }
});

export default router;
