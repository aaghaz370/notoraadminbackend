import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/books.js";
import uploadRoutes from "./routes/upload.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// 🧩 Middleware
app.use(express.json());

// ✅ CORS for Netlify frontend
app.use(
  cors({
    origin: ["https://notoraadmin.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Routes
app.use("/api/books", bookRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);

// ✅ Health check route (optional)
app.get("/", (req, res) => {
  res.send("✅ Notora Backend is running fine!");
});

// ✅ MongoDB connect + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    if (!process.env.ADMIN_PASSWORD) {
      console.warn("⚠️ ADMIN_PASSWORD not set — login will fail!");
    }
    app.listen(9090, () => console.log("🚀 Server running on port 9090"));
  })
  .catch((err) => console.error("❌ Mongo connection failed:", err));



