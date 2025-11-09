// routes/events.js
import express from "express";
import { recordEvent } from "../controllers/eventsController.js";
import { getAchievements } from "../controllers/achievementsController.js";
import { protect } from "../middleware/authMiddlewareWebsite.js";

const router = express.Router();

// ✅ Record reading or donation event
router.post("/:id/event", protect, recordEvent);

// ✅ Fetch all user achievements + stats
router.get("/:id/achievements", protect, getAchievements);


export default router;

