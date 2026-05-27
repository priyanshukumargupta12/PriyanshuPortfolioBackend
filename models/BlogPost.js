import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    published: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 1, // in minutes
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate readTime based on words count
blogPostSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordsPerMinute = 200;
    const words = this.content ? this.content.split(/\s+/).length : 0;
    this.readTime = Math.max(1, Math.ceil(words / wordsPerMinute));
  }
  next();
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;
