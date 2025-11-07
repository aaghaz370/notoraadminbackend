import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/books.js";
import uploadRoutes from "./routes/upload.js"; // ✅ Import pehle likho

dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS fix for Netlify frontend
app.use(
  cors({
    origin: ["https://notoraadmin.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Routes
app.use("/api/books", bookRoutes);
app.use("/api/upload", uploadRoutes); // ✅ Ab yahan likho (app ke baad)


// ✅ MongoDB connect + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(9090, () => console.log("🚀 Server running on port 9090"));
  })
  .catch((err) => console.error("❌ Mongo connection failed:", err));
