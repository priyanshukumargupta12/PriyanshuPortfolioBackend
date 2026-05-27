import BlogPost from "../models/BlogPost.js";
import cloudinary from "../config/cloudinary.js";

// Helper to upload base64 image to Cloudinary
const uploadImageToCloudinary = async (imageUrl) => {
  if (imageUrl && imageUrl.startsWith("data:")) {
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: "portfolio/blogs",
    });
    return uploadRes.secure_url;
  }
  return imageUrl;
};

// Helper to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ─── GET /api/blogs  (Public - published only) ──────────────────────────────────
export const getAllPosts = async (req, res, next) => {
  try {
    const { tag, search, page = 1, limit = 9 } = req.query;

    const filter = { published: true };
    if (tag) filter.tags = tag;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      BlogPost.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
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

// ─── GET /api/blogs/:slug  (Public) ─────────────────────────────────────────────
export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    
    if (!post) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/blogs  (Admin only) ──────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { title, summary, content, coverImage, tags, published } = req.body;

    let finalCoverImage = "";
    if (coverImage) {
      finalCoverImage = await uploadImageToCloudinary(coverImage);
    }

    const baseSlug = generateSlug(title);
    // Ensure slug uniqueness
    let slug = baseSlug;
    let slugExists = await BlogPost.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await BlogPost.findOne({ slug });
      counter++;
    }

    const post = await BlogPost.create({
      title,
      slug,
      summary,
      content,
      coverImage: finalCoverImage,
      tags,
      published,
    });

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/blogs/:id  (Admin only) ───────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const { title, summary, content, coverImage, tags, published, slug } = req.body;
    const postId = req.params.id;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    let finalCoverImage = post.coverImage;
    if (coverImage && coverImage !== post.coverImage) {
      finalCoverImage = await uploadImageToCloudinary(coverImage);
    }

    // If title changed and slug is not explicitly locked/edited, regenerate slug
    let finalSlug = slug || post.slug;
    if (title && title !== post.title && !slug) {
      const baseSlug = generateSlug(title);
      finalSlug = baseSlug;
      let slugExists = await BlogPost.findOne({ slug: finalSlug, _id: { $ne: postId } });
      let counter = 1;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await BlogPost.findOne({ slug: finalSlug, _id: { $ne: postId } });
        counter++;
      }
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      postId,
      {
        title,
        slug: finalSlug,
        summary,
        content,
        coverImage: finalCoverImage,
        tags,
        published,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/blogs/:id  (Admin only) ────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }
    res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/blogs/admin/all  (Admin only) ─────────────────────────────────────
export const getAllPostsAdmin = async (req, res, next) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json({ success: true, data: posts, total: posts.length });
  } catch (error) {
    next(error);
  }
};
