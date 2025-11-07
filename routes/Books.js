import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

// ✅ Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error });
  }
});

// ✅ Add book
router.post("/", async (req, res) => {
  console.log("📩 POST /api/books hit hua!");
  console.log("📦 Received Body:", req.body);

  try {
    const { name, author, genre, rating, thumbnail, pdfUrl } = req.body;
    if (!name || !author || !genre) {
      return res.status(400).json({ message: "Name, author, and genre are required" });
    }

    const newBook = new Book({ name, author, genre, rating, thumbnail, pdfUrl });
    await newBook.save();

    res.status(201).json({ message: "✅ Book added successfully", book: newBook });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ message: "Failed to add book", error });
  }
});

// ✅ Update book
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "✅ Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Failed to update book", error });
  }
});

// ✅ Delete book
router.delete("/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book", error });
  }
});

export default router;
