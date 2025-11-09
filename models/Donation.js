import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  thumbnail: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: "pending" }, // pending | approved | rejected
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
