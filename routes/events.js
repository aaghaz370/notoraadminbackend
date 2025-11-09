import express from "express";
import { recordEvent } from "../controllers/eventsController.js";
import { getAchievements } from "../controllers/achievementsController.js";
import { protect } from "../middleware/authMiddlewareWebsite.js"; // ✅ correct middleware

const router = express.Router();

// 🔐 Protect all routes with user auth
router.post("/:id/event", protect, recordEvent);
router.get("/:id/achievements", protect, getAchievements);

export default router;
