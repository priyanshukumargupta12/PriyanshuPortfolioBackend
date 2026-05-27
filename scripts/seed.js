import "dotenv/config";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Cv from "../models/Cv.js";
import Profile from "../models/Profile.js";

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding database...");

  // ─── Admin ─────────────────────────────────────────────────────────────────
  const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await Admin.create({
      email: process.env.ADMIN_EMAIL || "admin@portfolio.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123456",
      name: "Priyanshu Kumar",
    });
    console.log("✅ Admin created");
  } else {
    console.log("⚠️  Admin already exists, skipping");
  }

  // ─── Sample Projects ───────────────────────────────────────────────────────
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        title: "MERN E-Commerce Platform",
        description:
          "A full-stack e-commerce application with user authentication, product management, shopping cart, and Stripe payment integration.",
        shortDescription: "Full-stack e-commerce with Stripe payments",
        techStack: ["React", "Node.js", "Express", "MongoDB", "Stripe", "Redux"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/priyanshu",
        category: "fullstack",
        featured: true,
        order: 1,
      },
      {
        title: "Real-Time Chat Application",
        description:
          "A real-time chat application built with Socket.io supporting rooms, private messages, and file sharing.",
        shortDescription: "Real-time chat with Socket.io",
        techStack: ["React", "Socket.io", "Node.js", "Express", "MongoDB"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/priyanshu",
        category: "fullstack",
        featured: true,
        order: 2,
      },
      {
        title: "Portfolio Website",
        description: "This portfolio website built with MERN stack, featuring animations and admin dashboard.",
        shortDescription: "Personal portfolio with admin dashboard",
        techStack: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Node.js", "MongoDB"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/priyanshu",
        category: "fullstack",
        featured: false,
        order: 3,
      },
    ]);
    console.log("✅ Sample projects created");
  } else {
    console.log("⚠️  Projects already exist, skipping");
  }

  // ─── Skills ────────────────────────────────────────────────────────────────
  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    await Skill.insertMany([
      // Frontend
      { name: "React.js", level: 90, color: "#61DAFB", iconName: "SiReact", category: "frontend", order: 1 },
      { name: "JavaScript", level: 88, color: "#F7DF1E", iconName: "SiJavascript", category: "frontend", order: 2 },
      { name: "TypeScript", level: 75, color: "#3178C6", iconName: "SiTypescript", category: "frontend", order: 3 },
      { name: "HTML5", level: 95, color: "#E34F26", iconName: "SiHtml5", category: "frontend", order: 4 },
      { name: "CSS3", level: 90, color: "#1572B6", iconName: "SiCss", category: "frontend", order: 5 },
      { name: "Tailwind CSS", level: 92, color: "#06B6D4", iconName: "SiTailwindcss", category: "frontend", order: 6 },
      { name: "Next.js", level: 78, color: "#000000", iconName: "SiNextdotjs", category: "frontend", order: 7 },
      { name: "Framer Motion", level: 80, color: "#FF0055", iconName: "SiFramer", category: "frontend", order: 8 },

      // Backend
      { name: "Node.js", level: 85, color: "#339933", iconName: "SiNodedotjs", category: "backend", order: 1 },
      { name: "Express.js", level: 88, color: "#000000", iconName: "SiExpress", category: "backend", order: 2 },
      { name: "Python", level: 65, color: "#3776AB", iconName: "SiPython", category: "backend", order: 3 },
      { name: "REST APIs", level: 90, color: "#FF6B6B", iconName: "", category: "backend", order: 4 },

      // Database
      { name: "MongoDB", level: 85, color: "#47A248", iconName: "SiMongodb", category: "database", order: 1 },
      { name: "PostgreSQL", level: 72, color: "#4169E1", iconName: "SiPostgresql", category: "database", order: 2 },
      { name: "MySQL", level: 70, color: "#4479A1", iconName: "SiMysql", category: "database", order: 3 },
      { name: "Redis", level: 60, color: "#DC382D", iconName: "SiRedis", category: "database", order: 4 },
      { name: "Firebase", level: 75, color: "#FFCA28", iconName: "SiFirebase", category: "database", order: 5 },

      // Tools
      { name: "Git", level: 90, color: "#F05032", iconName: "SiGit", category: "tools", order: 1 },
      { name: "GitHub", level: 92, color: "#181717", iconName: "SiGithub", category: "tools", order: 2 },
      { name: "Docker", level: 68, color: "#2496ED", iconName: "SiDocker", category: "tools", order: 3 },
      { name: "Linux", level: 75, color: "#FCC624", iconName: "SiLinux", category: "tools", order: 4 },
      { name: "Postman", level: 88, color: "#FF6C37", iconName: "SiPostman", category: "tools", order: 5 },
      { name: "Figma", level: 70, color: "#F24E1E", iconName: "SiFigma", category: "tools", order: 6 },
      { name: "Vite", level: 85, color: "#646CFF", iconName: "SiVite", category: "tools", order: 7 },
      { name: "Vercel", level: 80, color: "#000000", iconName: "SiVercel", category: "tools", order: 8 }
    ]);
    console.log("✅ Skills created");
  } else {
    console.log("⚠️  Skills already exist, skipping");
  }

  // ─── CV ────────────────────────────────────────────────────────────────────
  const cvCount = await Cv.countDocuments();
  if (cvCount === 0) {
    const placeholderPdfBase64 = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8L1R5cGUvQ2F0YWxvZwogICAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iagogIDw8L1R5cGUvUGFnZXMKICAgL0tpZHNbMyAwIFJdCiAgIC9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKICA8PC9UeXBlL1BhZ2UKICAgL1BhcmVudCAyIDAgUgogICAvTWVkaWFCb3hbMCAwIDU5NSA4NDJdCiAgIC9SZXNvdXJjZXMgPDw+PgogICAvQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iagogIDw8L0xlbmd0aCAwPj4Kc3RyZWFtCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTYgMDAwMDAgbiAKMDAwMDAwMDAxMTEgMDAwMDAgbiAKMDAwMDAwMDIxMiAwMDAwMCBuIAp0cmFpbGVyCiAgPDwvU2l6ZSA1CiAgIC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI2MwolJUVPRg==";
    await Cv.create({
      pdfData: placeholderPdfBase64,
      filename: "resume.pdf"
    });
    console.log("✅ Sample CV PDF created");
  } else {
    console.log("⚠️  CV already exists, skipping");
  }

  // ─── Profile ────────────────────────────────────────────────────────────────
  const profileCount = await Profile.countDocuments();
  if (profileCount === 0) {
    await Profile.create({
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
    console.log("✅ Profile created");
  } else {
    console.log("⚠️  Profile already exists, skipping");
  }

  console.log("🎉 Seeding complete!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
