import mongoose from "mongoose";

const userEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["read", "share", "donate", "admin_bonus"], // new type for admin NT
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserEvent = mongoose.model("UserEvent", userEventSchema);
export default UserEvent;

