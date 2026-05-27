import express from "express";
import { body } from "express-validator";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAllProjectsAdmin,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const projectValidation = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("description").notEmpty().withMessage("Description is required").trim(),
  body("techStack")
    .isArray({ min: 1 })
    .withMessage("At least one technology is required"),
];

// ─── Admin Routes (All must match before parameterized public routes) ──────────
router.get("/admin/all", protect, getAllProjectsAdmin);

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/", getAllProjects);
router.get("/:id", getProjectById);

// ─── Dynamic Admin Routes ──────────────────────────────────────────────────────
router.post("/", protect, projectValidation, validateRequest, createProject);
router.put("/:id", protect, projectValidation, validateRequest, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
