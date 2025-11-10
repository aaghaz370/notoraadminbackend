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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["read", "share", "donate", "admin_bonus"], // ✅ include admin_bonus
      required: true,
    },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", default: null },
    description: { type: String, default: "" },
    points: { type: Number, default: 0 }, // ✅ ensure numeric value saved
    ip: { type: String, default: "" },
    ua: { type: String, default: "" },
  },
  { timestamps: true, strict: false } // ✅ allow extra fields if needed
);

export default mongoose.model("UserEvent", userEventSchema);

