import express from "express";
import { trackEvent, getAnalyticsSummary } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to track pageviews and download clicks
router.post("/track", trackEvent);

// Protected admin route to get summary stats
router.get("/summary", protect, getAnalyticsSummary);

export default router;
