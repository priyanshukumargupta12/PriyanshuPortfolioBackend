import Project from "../models/Project.js";
import cloudinary from "../config/cloudinary.js";

// Helper to upload base64 image to Cloudinary
const uploadImageToCloudinary = async (imageUrl) => {
  if (imageUrl && imageUrl.startsWith("data:")) {
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: "portfolio/projects",
    });
    return uploadRes.secure_url;
  }
  return imageUrl;
};

// ─── GET /api/projects ────────────────────────────────────────────────────────
export const getAllProjects = async (req, res, next) => {
  try {
    const { category, featured, page = 1, limit = 10 } = req.query;

    const filter = { published: true };
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ featured: -1, order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/projects  (Admin only) ─────────────────────────────────────────
export const createProject = async (req, res, next) => {
  try {
    if (req.body.imageUrl) {
      req.body.imageUrl = await uploadImageToCloudinary(req.body.imageUrl);
    }
    const project = await Project.create(req.body);
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/projects/:id  (Admin only) ──────────────────────────────────────
export const updateProject = async (req, res, next) => {
  try {
    if (req.body.imageUrl) {
      req.body.imageUrl = await uploadImageToCloudinary(req.body.imageUrl);
    }
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, message: "Project updated successfully", data: project });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/projects/:id  (Admin only) ───────────────────────────────────
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/projects/admin/all  (Admin only) ────────────────────────────────
export const getAllProjectsAdmin = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, data: projects, total: projects.length });
  } catch (error) {
    next(error);
  }
};
