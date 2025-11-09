// routes/events.js
import express from "express";
import { recordEvent } from "../controllers/eventsController.js";
import { getAchievements } from "../controllers/achievementsController.js";

// use the website protect middleware (named export 'protect')
import { protect } from "../middleware/authMiddlewareWebsite.js";

const router = express.Router();

// record event for user id (user must be same as token owner)
router.post("/:id/event", protect, recordEvent);
router.get("/:id/achievements", protect, getAchievements);

export default router;
