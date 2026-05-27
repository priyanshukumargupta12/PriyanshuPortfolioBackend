import express from "express";
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getAllPostsAdmin,
} from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Admin Routes (All must match before parameterized public routes) ──────────
router.get("/admin/all", protect, getAllPostsAdmin);

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);

// ─── Protected Admin Routes ──────────────────────────────────────────────────
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
