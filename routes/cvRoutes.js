import express from "express";
import {
  downloadCv,
  getCvInfo,
  uploadCv,
  deleteCv,
} from "../controllers/cvController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/download", downloadCv);
router.get("/status", getCvInfo);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
router.post("/", protect, uploadCv);
router.delete("/", protect, deleteCv);

export default router;
