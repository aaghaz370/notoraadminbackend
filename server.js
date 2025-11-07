import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/books.js";
import uploadRoutes from "./routes/upload.js";
app.use("/api/upload", uploadRoutes);

dotenv.config();
const app = express();

// ✅ CORS fix — allow frontend domain
app.use(
  cors({
    origin: ["https://notoraadmin.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/books", bookRoutes);

// ✅ MongoDB connect and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(9090, () => console.log("🚀 Server running on port 9090"));
  })
  .catch((err) => console.error("❌ Mongo connection failed:", err));





