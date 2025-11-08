import express from "express";
import {
  getCommentsByBook,
  addComment,
  replyToComment,
   deleteComment,
  deleteReply,
   editReply,  
} from "../controllers/commentController.js";

const router = express.Router();

// GET comments for a book
router.get("/:bookId", getCommentsByBook);

// POST a new comment
router.post("/", addComment);

// POST a reply to an existing comment
router.post("/reply/:commentId", replyToComment);

export default router;
router.delete("/:id", deleteComment);
router.delete("/reply/:commentId/:replyId", deleteReply);
// ✅ EDIT routes
router.put("/:id", editComment);
router.put("/reply/:commentId/:replyId", editReply);
