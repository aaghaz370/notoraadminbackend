import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  thumbnail: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  rating: { type: Number, default: 0 },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
