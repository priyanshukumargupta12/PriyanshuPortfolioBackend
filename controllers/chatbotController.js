import Profile from "../models/Profile.js";
import Skill from "../models/Skill.js";
import Project from "../models/Project.js";

// Helper to generate a detailed system instruction using database data
const buildSystemInstruction = async () => {
  try {
    const [profile, skills, projects] = await Promise.all([
      Profile.findOne(),
      Skill.find().sort({ category: 1, order: 1 }),
      Project.find({ published: true }).sort({ order: 1 })
    ]);

    const name = profile?.name || "Priyanshu Kumar";
    const title = profile?.title || "Full Stack Developer";
    const bio = profile?.bio || "";
    const longBio = profile?.longBio || "";
    const location = profile?.location || "India";
    const email = profile?.email || "";
    const phone = profile?.phone || "";
    const availability = profile?.availability || "Available";

    // Format skills
    const skillsGrouped = {};
    skills.forEach(s => {
      if (!skillsGrouped[s.category]) skillsGrouped[s.category] = [];
      skillsGrouped[s.category].push(`${s.name} (Level: ${s.level}%)`);
    });
    const skillsStr = Object.keys(skillsGrouped)
      .map(cat => `### ${cat.toUpperCase()}:\n- ${skillsGrouped[cat].join("\n- ")}`)
      .join("\n\n");

    // Format projects
    const projectsStr = projects
      .map(p => `- **${p.title}** (${p.category}): ${p.description}\n  Tech Stack: ${p.techStack.join(", ")}\n  Github: ${p.githubUrl || "N/A"} | Live: ${p.liveUrl || "N/A"}`)
      .join("\n\n");

    // Format experience
    const expStr = (profile?.experience || [])
      .map(e => `- **${e.role}** at **${e.company}** (${e.period}): ${e.description}\n  Keywords: ${e.tags?.join(", ")}`)
      .join("\n");

    // Format education
    const eduStr = (profile?.education || [])
      .map(edu => `- **${edu.degree}** in **${edu.field}** from **${edu.institution}** (${edu.year}) - Grade: ${edu.grade}\n  ${edu.description}`)
      .join("\n");

    // Format socials
    const socials = profile?.socials || {};
    const socialsStr = Object.keys(socials)
      .map(platform => `- **${platform}**: ${socials[platform]}`)
      .join("\n");

    return `You are a helpful, professional, and friendly AI assistant representing ${name}, a ${title}.
You will answer questions from visitors to his portfolio website.
Here is all the authentic context about ${name} sourced directly from his live database. Use ONLY this information to respond. Do not make up facts.

## Biography
${longBio || bio || "A passionate full-stack web developer."}

## Personal Info
- **Name**: ${name}
- **Title**: ${title}
- **Location**: ${location}
- **Email**: ${email}
- **Phone**: ${phone}
- **Availability**: ${availability}

## Skills
${skillsStr || "React, Node.js, MongoDB, Express, JavaScript"}

## Projects
${projectsStr || "Portfolio website, MERN applications"}

## Work Experience
${expStr || "Freelance Full Stack developer"}

## Education
${eduStr || "Computer Science student"}

## Social Media Links
${socialsStr}

### Instructions:
1. Speak in the third person when referring to ${name} (e.g., "${name} is a full-stack engineer" or "He built an E-Commerce platform").
2. Be polite, concise, and professional.
3. If asked about something not in this context, politely say that you don't have that information but visitors can contact ${name} directly via his email: ${email}.
4. Keep answers brief (typically 1-3 sentences or a short bulleted list) so they are easy to read in a small chat window.`;
  } catch (error) {
    console.error("Error building chatbot system instruction:", error);
    return "You are an AI assistant representing Priyanshu Kumar. Be polite and answer questions about his skills and projects.";
  }
};

// Local fallback responder (rule-based keyword matching) in case Gemini API is offline or key is missing
const getLocalFallbackResponse = (message, systemPrompt) => {
  const query = (message || "").toLowerCase();
  
  if (query.includes("skill") || query.includes("technology") || query.includes("what can you do") || query.includes("language")) {
    return "Priyanshu is skilled in React.js, Node.js, Express.js, MongoDB, JavaScript, and TypeScript, along with tools like Git, Docker, and Linux. He specializes in full-stack MERN development.";
  }
  if (query.includes("project") || query.includes("portfolio") || query.includes("built") || query.includes("work")) {
    return "Priyanshu has built several full-stack applications, including a MERN E-Commerce Platform integrated with Stripe, a Real-Time Chat App with Socket.io, and this personal portfolio.";
  }
  if (query.includes("contact") || query.includes("email") || query.includes("phone") || query.includes("hire") || query.includes("social")) {
    return "You can reach Priyanshu via email at nkggupta8340@gmail.com. You can also view his social profiles on GitHub and LinkedIn links on the About page.";
  }
  if (query.includes("experience") || query.includes("job") || query.includes("work") || query.includes("history")) {
    return "Priyanshu has experience working as a Freelance Full Stack Developer delivering custom web applications, and contributing to open-source software.";
  }
  if (query.includes("education") || query.includes("college") || query.includes("degree") || query.includes("university")) {
    return "Priyanshu is pursuing a Bachelor of Technology in Computer Science & Engineering, focusing on data structures, algorithms, and web development.";
  }
  
  return "Hello! I am Priyanshu's AI assistant. Feel free to ask me about his skills, projects, work experience, education, or how to contact him!";
};

// ─── POST /api/chatbot ─────────────────────────────────────────────────────────
export const handleChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const systemPrompt = await buildSystemInstruction();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key" || apiKey.includes("change_this")) {
      console.warn("⚠️  GEMINI_API_KEY is not configured. Running chatbot in local fallback mode.");
      const fallbackAnswer = getLocalFallbackResponse(message, systemPrompt);
      return res.json({
        success: true,
        data: {
          role: "model",
          parts: [{ text: fallbackAnswer }]
        },
        mode: "fallback"
      });
    }

    // Format chat thread contents for Gemini API (it expects the structure contents: [{role: string, parts: [{text: string}]}])
    const contents = [
      ...history.map(h => ({
        role: h.role === "assistant" ? "model" : h.role, // normalize roles for Gemini
        parts: [{ text: h.content || h.parts?.[0]?.text || "" }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    // Request payload to Gemini
    const geminiPayload = {
      contents,
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(geminiPayload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (Status ${response.status}): ${errorText}`);
    }

    const geminiData = await response.json();
    const modelResponse = geminiData.candidates?.[0]?.content;

    if (!modelResponse) {
      throw new Error("Invalid response format received from Gemini API");
    }

    res.json({
      success: true,
      data: {
        role: "model",
        parts: [{ text: modelResponse.parts?.[0]?.text || "" }]
      },
      mode: "api"
    });

  } catch (error) {
    console.error("Chatbot processing failed:", error);
    // Graceful fallback to avoid throwing a 500 error in production
    const fallbackAnswer = getLocalFallbackResponse(req.body.message, "");
    res.json({
      success: true,
      data: {
        role: "model",
        parts: [{ text: `${fallbackAnswer} (Running in offline mode)` }]
      },
      mode: "fallback-error"
    });
  }
};
