import express from "express";
import { body } from "express-validator";
import {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const skillValidation = [
  body("name").notEmpty().withMessage("Skill name is required").trim(),
  body("level")
    .isInt({ min: 0, max: 100 })
    .withMessage("Level/rating must be an integer between 0 and 100"),
  body("category")
    .isIn(["frontend", "backend", "database", "tools"])
    .withMessage("Valid skill category is required"),
];

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/", getAllSkills);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
router.post("/", protect, skillValidation, validateRequest, createSkill);
router.put("/:id", protect, skillValidation, validateRequest, updateSkill);
router.delete("/:id", protect, deleteSkill);

export default router;
