import express from "express";
import { body } from "express-validator";
import { login, getMe, logout, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

// GET /api/auth/me  (protected)
router.get("/me", protect, getMe);

// POST /api/auth/logout  (protected)
router.post("/logout", protect, logout);

// POST /api/auth/change-password  (protected)
router.post(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validateRequest,
  changePassword
);

export default router;
