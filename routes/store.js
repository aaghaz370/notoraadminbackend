import express from "express";
import { createBuyRequest, listBuyRequests } from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddlewareWebsite.js";

const router = express.Router();

// POST /api/store/request  (protected)
router.post("/request", protect, createBuyRequest);

// GET /api/store/requests  (admin only) - optional
router.get("/requests", protect, listBuyRequests);

export default router;
