import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, "Skill rating/level is required"],
      min: [0, "Level cannot be less than 0"],
      max: [100, "Level cannot be more than 100"],
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    iconName: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["frontend", "backend", "database", "tools"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for performance
skillSchema.index({ category: 1, order: 1 });

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
