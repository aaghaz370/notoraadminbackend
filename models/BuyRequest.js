import mongoose from "mongoose";

const buyRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    itemId: { type: String },
    itemName: { type: String, required: true },
    cost: { type: Number, required: true },
    note: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    meta: { type: Object, default: {} }, // optional: store UA / IP etc.
  },
  { timestamps: true }
);

const BuyRequest = mongoose.model("BuyRequest", buyRequestSchema);
export default BuyRequest;
