import express from "express";
import { body } from "express-validator";
import {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const contactValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),
];

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.post("/", contactValidation, validateRequest, submitContact);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
router.get("/", protect, getAllContacts);
router.get("/stats", protect, getContactStats);
router.patch("/:id/status", protect, updateContactStatus);
router.delete("/:id", protect, deleteContact);

export default router;
