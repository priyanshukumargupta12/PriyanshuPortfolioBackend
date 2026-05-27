import Profile from "../models/Profile.js";
import cloudinary from "../config/cloudinary.js";

// Helper to upload base64 image to Cloudinary
const uploadImageToCloudinary = async (imageUrl) => {
  if (imageUrl && imageUrl.startsWith("data:")) {
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: "portfolio/profile",
    });
    return uploadRes.secure_url;
  }
  return imageUrl;
};

// ─── GET /api/profile ──────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    
    // Fallback/auto-seed if database is empty
    if (!profile) {
      profile = await Profile.create({
        name: "Priyanshu Kumar",
        title: "Full Stack Developer",
        profileImage: "",
        roles: [
          "Full Stack Developer",
          "MERN Stack Engineer",
          "React Specialist",
          "Node.js Developer",
          "Problem Solver",
        ],
        bio: "I'm a passionate Full Stack Developer specializing in the MERN stack. I build scalable, performant web applications with clean code and modern design. I love turning complex problems into elegant digital solutions.",
        longBio: "With a deep passion for web development, I specialize in building end-to-end applications using the MERN stack (MongoDB, Express.js, React, Node.js). I care deeply about code quality, performance, and user experience. When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, and continuously growing as a developer. I believe great software is not just about working code — it's about crafting experiences that users love.",
        location: "India",
        email: "priyanshu@example.com",
        phone: "+91 98765 43210",
        availability: "Open to opportunities",
        socials: {
          github: "https://github.com/priyanshu",
          linkedin: "https://linkedin.com/in/priyanshu",
          twitter: "https://twitter.com/priyanshu",
          instagram: "https://instagram.com/priyanshu",
        },
        stats: {
          projectsBuilt: 20,
          yearsExperience: 2,
          technologies: 15,
          githubRepos: 30,
        },
        education: [
          {
            degree: "Bachelor of Technology",
            field: "Computer Science & Engineering",
            institution: "Your University Name",
            year: "2021 – 2025",
            grade: "8.5 CGPA",
            description: "Focused on Data Structures, Algorithms, Web Development, and Software Engineering.",
          },
        ],
        experience: [
          {
            role: "Full Stack Developer (Freelance)",
            company: "Self-employed",
            period: "2023 – Present",
            description: "Building custom web applications for clients using MERN stack. Delivered 10+ projects on time.",
            tags: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
          },
          {
            role: "Open Source Contributor",
            company: "GitHub",
            period: "2022 – Present",
            description: "Contributed to various open-source React and Node.js projects. Focused on bug fixes and feature additions.",
            tags: ["React", "JavaScript", "Git"],
          },
        ],
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    
    let updateData = { ...req.body };

    // If there's a new profile image (base64 data)
    if (updateData.profileImage) {
      updateData.profileImage = await uploadImageToCloudinary(updateData.profileImage);
    }

    if (!profile) {
      profile = await Profile.create(updateData);
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, updateData, {
        new: true,
        runValidators: true,
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
