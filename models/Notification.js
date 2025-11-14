import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Single / Multiple / All
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["new_book", "nt_added", "update", "general"],
      default: "general",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
