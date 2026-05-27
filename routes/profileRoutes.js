import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to fetch profile
router.get("/", getProfile);

// Protected admin route to update profile
router.put("/", protect, updateProfile);

export default router;
