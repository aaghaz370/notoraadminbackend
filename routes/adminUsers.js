import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddlewareWebsite.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "_id name email").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
