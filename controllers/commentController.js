import Comment from "../models/Comment.js";

export const getComments = async (req, res) => {
  const { bookId } = req.query;
  const comments = await Comment.find({ bookId }).populate("userId", "name");
  res.json(comments);
};

export const addComment = async (req, res) => {
  const { bookId, text } = req.body;
  const comment = await Comment.create({ bookId, text, userId: req.user._id });
  res.status(201).json(comment);
};
