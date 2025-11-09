import express from "express";
import {
  getCommentsByBook,
  replyToComment,
  deleteComment,
  deleteReply,
  editComment,
  editReply,
} from "../controllers/commentController.js";
import Comment from "../models/Comment.js";
import Admin from "../models/Admin.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   ✅ GET COMMENTS for a book
=============================== */
router.get("/:bookId", getCommentsByBook);

/* ============================
   ✅ ADD NEW COMMENT
=============================== */
router.post("/", async (req, res) => {
  try {
    const { bookId, name, email, text } = req.body;

    if (!bookId || !name || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check if user is admin
    const adminUser = await Admin.findOne({ email });
    const isAdmin = !!adminUser;

    // ✅ Create comment
    const comment = new Comment({
      bookId,
      name,
      email,
      text,
      isAdmin,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ============================
   ✅ REPLY to a comment
=============================== */
router.post("/reply/:commentId", replyToComment);

/* ============================
   ✅ DELETE comment or reply
=============================== */
router.delete("/:id", deleteComment);
router.delete("/reply/:commentId/:replyId", deleteReply);

/* ============================
   ✅ EDIT comment or reply
=============================== */
router.put("/:id", editComment);
router.put("/reply/:commentId/:replyId", editReply);

export default router;
