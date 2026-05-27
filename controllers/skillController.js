import Skill from "../models/Skill.js";

// ─── GET /api/skills  (Public) ────────────────────────────────────────────────
export const getAllSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1, name: 1 });
    res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/skills  (Admin only) ───────────────────────────────────────────
export const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/skills/:id  (Admin only) ─────────────────────────────────────────
export const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    res.json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/skills/:id  (Admin only) ──────────────────────────────────────
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
