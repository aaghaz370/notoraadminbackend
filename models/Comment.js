import mongoose from "mongoose";

// ✅ Nested reply schema
const replySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Main comment schema
const commentSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true }, // optional (for admin detection)
    text: { type: String, required: true, trim: true },
    replies: [replySchema],
    isAdmin: { type: Boolean, default: false }, // ✅ moved INSIDE schema
  },
  { timestamps: true } // ✅ this stays outside field definitions
);

// ✅ Export model
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
