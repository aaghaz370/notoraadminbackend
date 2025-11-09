import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
