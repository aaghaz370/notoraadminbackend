import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    name: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    replies: [replySchema],
  },
  { timestamps: true }
);
isAdmin: { type: Boolean, default: false },

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
