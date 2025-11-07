import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/books.js";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["https://notoraadmin.netlify.app"], // 👈 yahan apna frontend domain likho
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://notoraadmin.netlify.app/"
],

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Routes
app.use("/api/books", bookRoutes);

// ✅ DB + Server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(9090, () => console.log("🚀 Server running on port 9090"));
  })
  .catch((err) => console.error("❌ Mongo connection failed:", err));


