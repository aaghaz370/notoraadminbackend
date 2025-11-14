import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ⚠️ WARNING: PUBLIC USERS API (NO AUTH)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "name email _id");
    res.json(users);
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
