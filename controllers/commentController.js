import Comment from "../models/Comment.js";

// 🧩 Get all comments for a book
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

// 🧩 Add new comment
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

// 🧩 Reply to any comment or sub-reply (supports 3 levels)
export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { name, text, parentReplyId } = req.body;

    if (!name || !text)
      return res.status(400).json({ message: "Missing name or text" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // if replying to a reply (nested reply)
    if (parentReplyId) {
      const targetReply = findReply(comment.replies, parentReplyId, 0);
      if (!targetReply) return res.status(404).json({ message: "Parent reply not found" });

      targetReply.replies = targetReply.replies || [];
      if (depthOfReply(targetReply) >= 2)
        return res.status(400).json({ message: "Max 3 reply levels reached" });

      targetReply.replies.push({ name, text });
    } else {
      comment.replies.push({ name, text });
    }

    await comment.save();
    res.json({ message: "Reply added", comment });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Failed to add reply" });
  }
};

// Helper: find nested reply
function findReply(replies, id, depth) {
  for (let r of replies) {
    if (r._id.toString() === id) return r;
    if (r.replies && r.replies.length) {
      const found = findReply(r.replies, id, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function depthOfReply(reply) {
  let depth = 0;
  let current = reply;
  while (current.replies && current.replies.length > 0) {
    depth++;
    current = current.replies[0];
  }
  return depth;
}


// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// Delete reply
export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
    await comment.save();
    res.json({ message: "Reply deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reply" });
  }
};
