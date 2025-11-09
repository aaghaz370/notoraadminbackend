import mongoose from "mongoose";

const userEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["read","share","donate"], required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  ip: String,
  ua: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserEvent", userEventSchema);
