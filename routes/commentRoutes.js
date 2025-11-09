import express from "express";
import {
  getCommentsByBook,
  addComment,
  replyToComment,
   deleteComment,
  deleteReply,
  editComment,
   editReply,  
} from "../controllers/commentController.js";

const router = express.Router();

// GET comments for a book
router.get("/:bookId", getCommentsByBook);

import Admin from "../models/Admin.js";

// Inside POST /api/comments
const adminUser = await Admin.findOne({ email: req.body.email });
const isAdmin = !!adminUser;

const comment = new Comment({
  bookId: req.body.bookId,
  name: req.body.name,
  email: req.body.email,
  text: req.body.text,
  isAdmin,  // ✅ ye flag add kar do
});


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
