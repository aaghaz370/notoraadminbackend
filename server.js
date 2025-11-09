import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/books.js";
import uploadRoutes from "./routes/upload.js";
import adminAuthRoutes from "./routes/auth.js";
import commentRoutes from "./routes/commentRoutes.js";
import userAuthRoutes from "./routes/authRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";





dotenv.config();

const app = express();

// 🧩 Middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "https://notora8.netlify.app",
      "https://notoraadmin.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ✅ Routes
app.use("/api/books", bookRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminAuthRoutes); // for admin password login
app.use("/api/users", userAuthRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/admins", adminRoutes);


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









