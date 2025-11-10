// import mongoose from "mongoose";

// const userEventSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
//   type: { type: String, enum: ["read", "share", "donate", "admin_bonus"], required: true },
//  points: { type: Number, default: 0 },
//   bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
//   ip: String,
//   ua: String,
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("UserEvent", userEventSchema);
import mongoose from "mongoose";

const userEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["read", "share", "donate", "admin_bonus"],
      required: true,
    },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    description: { type: String, default: "" },
    points: { type: Number, default: 0 },
    ip: String,
    ua: String,
  },
  { timestamps: true, strict: true } // ✅ timestamps + schema control
);

const UserEvent = mongoose.model("UserEvent", userEventSchema);
export default UserEvent;
