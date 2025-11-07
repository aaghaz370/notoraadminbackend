import Comment from "../models/Comment.js";

// @desc Get comments for a specific book
export const getCommentsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const comments = await Comment.find({ bookId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error loading comments:", error);
    res.status(500).json({ message: "Failed to load comments" });
  }
};

// @desc Add a new comment
export const addComment = async (req, res) => {
  try {
    const { bookId, name, text } = req.body;
    if (!bookId || !name || !text)
      return res.status(400).json({ message: "Missing required fields" });

    const newComment = await Comment.create({ bookId, name, text });
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// @desc Reply to a comment
export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { name, text } = req.body;

    if (!name || !text)
      return res.status(400).json({ message: "Missing name or text" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ name, text });
    await comment.save();

    res.json({ message: "Reply added", comment });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Failed to add reply" });
  }
};


