import express from "express";
import { sendNotification, getUserNotifications } from "../controllers/notificationsController.js";
// import { protect, adminOnly } from "../middleware/authMiddlewareWebsite.js";

const router = express.Router();

// 🟥 ADMIN — send notification
router.post("/send", sendNotification);


// 🟩 USER — get their notifications
router.get("/my",  getUserNotifications);

export default router;
