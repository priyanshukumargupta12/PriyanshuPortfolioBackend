import "dotenv/config";
import mongoose from "mongoose";
import BlogPost from "../models/BlogPost.js";

async function runBlogTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio");
    console.log("Connected to MongoDB!");

    // Clean up test posts if any exist
    await BlogPost.deleteMany({ title: /Test Blog/ });

    // 1. Create a blog post
    console.log("\n--- Creating Test Blog Post ---");
    const newPost = await BlogPost.create({
      title: "Test Blog Post 1",
      slug: "test-blog-post-1",
      summary: "This is a summary of the test blog post.",
      content: "This is the content of the test blog post. It has some words inside it to check the pre-save readTime hook.",
      coverImage: "https://res.cloudinary.com/dygpt69iq/image/upload/v12345/test.png",
      tags: ["React", "Node"],
      published: true
    });
    console.log("Created blog post:", JSON.stringify(newPost, null, 2));
    console.log("Calculated read time:", newPost.readTime, "min");

    // 2. Fetch public blog posts (published: true)
    console.log("\n--- Fetching Published Blog Posts ---");
    const publishedPosts = await BlogPost.find({ published: true });
    console.log("Published posts count:", publishedPosts.length);

    // 3. Test slug uniqueness
    console.log("\n--- Testing Slug Uniqueness ---");
    try {
      await BlogPost.create({
        title: "Test Blog Post 2",
        slug: "test-blog-post-1", // duplicate slug
        summary: "Summary.",
        content: "Content.",
        published: false
      });
      console.log("FAIL: Created post with duplicate slug without error!");
    } catch (err) {
      console.log("SUCCESS: Correctly failed to create duplicate slug. Error:", err.message);
    }

    // 4. Update the blog post
    console.log("\n--- Updating Blog Post ---");
    newPost.title = "Updated Test Blog Title";
    await newPost.save();
    console.log("Updated blog post title:", newPost.title);

    // 5. Delete the blog post
    console.log("\n--- Deleting Blog Post ---");
    await BlogPost.findByIdAndDelete(newPost._id);
    console.log("Deleted blog post successfully.");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  } catch (error) {
    console.error("Blog CRUD tests failed:", error);
    process.exit(1);
  }
}

runBlogTests();
