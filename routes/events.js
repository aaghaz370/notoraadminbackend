import express from "express";
import { recordEvent } from "../controllers/eventsController.js";
import { getAchievements } from "../controllers/achievementsController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // your protect

const router = express.Router();

router.post("/:id/event", authMiddleware, recordEvent); // record event for user id
router.get("/:id/achievements", authMiddleware, getAchievements);

export default router;
