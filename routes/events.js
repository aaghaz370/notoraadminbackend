import express from "express";
import { recordEvent } from "../controllers/eventsController.js";
import { getAchievements } from "../controllers/achievementsController.js";
+import { protect } from "../middleware/authMiddlewareWebsite.js";

const router = express.Router();

router.post("/:id/event", protect, recordEvent);
router.get("/:id/achievements", protect, getAchievements);

export default router;
