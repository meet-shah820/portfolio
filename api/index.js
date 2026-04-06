import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { answerFromPortfolioData } from "../server/knowledge-chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_CONTENT_PATH = path.join(__dirname, "data", "site-content.json");

dotenv.config({ path: path.join(__dirname, ".env") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, "env.example") });
}
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

function loadSiteContent() {
  const raw = fs.readFileSync(SITE_CONTENT_PATH, "utf8");
  return JSON.parse(raw);
}

function saveSiteContent(data) {
  fs.writeFileSync(SITE_CONTENT_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normalizeSkills(skills = []) {
  return skills.map((s, i) => ({
    id: s.id || `sk_${Date.now()}_${i}`,
    name: String(s.name || "Skill").trim() || "Skill",
    value: Math.min(100, Math.max(0, Number(s.value) || 0)),
  }));
}

function skillsForApi(data) {
  return normalizeSkills(data.skills).map((s) => ({ _id: s.id, id: s.id, name: s.name, value: s.value }));
}

/** Override with PROFILE_EDIT_PASSWORD in server .env (recommended). */
const PROFILE_EDIT_PASSWORD = String(process.env.PROFILE_EDIT_PASSWORD || "11232005").trim();

const PROFILE_KEYS = [
  "fullName",
  "tagline",
  "bio",
  "email",
  "phone",
  "location",
  "githubUrl",
  "linkedinUrl",
  "instagramUrl",
  "experienceYears",
  "aboutLead",
  "aboutStory",
  "experience",
  "education",
  "availability",
];

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Live", "Beta", "Development"],
      default: "Development",
    },
    tech: { type: [String], default: [] },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    demoUrl: { type: String, default: "" },
    repoUrl: { type: String, default: "" },
    span: { type: String, default: "col-span-12 lg:col-span-6" },
    gradient: { type: String, default: "from-[#00FFC2] to-[#00E0FF]" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, default: "" },
    date: { type: String, default: "" },
    category: { type: String, default: "General" },
    iconKey: {
      type: String,
      enum: ["Shield", "Trophy", "Star", "Zap", "Target"],
      default: "Star",
    },
    color: { type: String, default: "#00FFC2" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
const Achievement = mongoose.model("Achievement", achievementSchema);

const SEED_PROJECTS = [
  {
    title: "E-Commerce Platform",
    description: "Full-stack marketplace with real-time inventory and payments",
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    status: "Live",
    stars: 234,
    forks: 45,
    span: "col-span-12 lg:col-span-8",
    gradient: "from-[#00FFC2] to-[#00E0FF]",
    sortOrder: 0,
  },
  {
    title: "AI Chat Assistant",
    description: "Intelligent chatbot with NLP capabilities",
    tech: ["Next.js", "OpenAI", "PostgreSQL"],
    status: "Beta",
    stars: 189,
    forks: 32,
    span: "col-span-12 lg:col-span-4",
    gradient: "from-[#00E0FF] to-[#9D4EDD]",
    sortOrder: 1,
  },
  {
    title: "Social Media Dashboard",
    description: "Analytics platform for multi-channel insights",
    tech: ["React", "Express", "Redis"],
    status: "Live",
    stars: 156,
    forks: 28,
    span: "col-span-12 lg:col-span-4",
    gradient: "from-[#9D4EDD] to-[#FF006E]",
    sortOrder: 2,
  },
  {
    title: "Project Management Tool",
    description: "Collaborative workspace with real-time updates",
    tech: ["React", "Socket.io", "MongoDB"],
    status: "Live",
    stars: 298,
    forks: 67,
    span: "col-span-12 lg:col-span-8",
    gradient: "from-[#FF006E] to-[#FFBE0B]",
    sortOrder: 3,
  },
  {
    title: "Weather Forecast App",
    description: "Real-time weather data with interactive maps",
    tech: ["React", "OpenWeather API"],
    status: "Live",
    stars: 87,
    forks: 19,
    span: "col-span-12 lg:col-span-6",
    gradient: "from-[#FFBE0B] to-[#00FFC2]",
    sortOrder: 4,
  },
  {
    title: "Fitness Tracker",
    description: "Personal health monitoring with workout plans",
    tech: ["React Native", "Node.js", "MongoDB"],
    status: "Development",
    stars: 124,
    forks: 23,
    span: "col-span-12 lg:col-span-6",
    gradient: "from-[#00FFC2] to-[#9D4EDD]",
    sortOrder: 5,
  },
];

const SEED_ACHIEVEMENTS = [
  {
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2025",
    category: "Cloud",
    iconKey: "Shield",
    color: "#FF9900",
    sortOrder: 0,
  },
  {
    title: "MongoDB Certified Developer",
    issuer: "MongoDB University",
    date: "2024",
    category: "Database",
    iconKey: "Trophy",
    color: "#00ED64",
    sortOrder: 1,
  },
  {
    title: "React Advanced Patterns",
    issuer: "Meta Blueprint",
    date: "2024",
    category: "Frontend",
    iconKey: "Star",
    color: "#61DAFB",
    sortOrder: 2,
  },
  {
    title: "Node.js Application Developer",
    issuer: "OpenJS Foundation",
    date: "2024",
    category: "Backend",
    iconKey: "Zap",
    color: "#68A063",
    sortOrder: 3,
  },
  {
    title: "TypeScript Expert",
    issuer: "Microsoft Learn",
    date: "2025",
    category: "Language",
    iconKey: "Target",
    color: "#3178C6",
    sortOrder: 4,
  },
  {
    title: "Docker Certified Associate",
    issuer: "Docker Inc.",
    date: "2024",
    category: "DevOps",
    iconKey: "Shield",
    color: "#2496ED",
    sortOrder: 5,
  },
  {
    title: "GraphQL Fundamentals",
    issuer: "Apollo GraphQL",
    date: "2024",
    category: "API",
    iconKey: "Star",
    color: "#E535AB",
    sortOrder: 6,
  },
  {
    title: "Kubernetes Administrator",
    issuer: "CNCF",
    date: "2025",
    category: "DevOps",
    iconKey: "Trophy",
    color: "#326CE5",
    sortOrder: 7,
  },
];

function adminAuth(req, res, next) {
  const required = process.env.ADMIN_API_KEY;
  if (!required) return next();
  if (req.headers["x-admin-key"] === required) return next();
  return res.status(401).json({ error: "Invalid or missing x-admin-key header" });
}

async function seedIfEmpty() {
  if ((await Project.countDocuments()) === 0) {
    await Project.insertMany(SEED_PROJECTS);
    console.log("Seeded default projects.");
  }
  if ((await Achievement.countDocuments()) === 0) {
    await Achievement.insertMany(SEED_ACHIEVEMENTS);
    console.log("Seeded default achievements.");
  }
}

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Add it to server/.env (next to index.js).");
    console.error(`Looked for: ${path.join(__dirname, ".env")}`);
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
  await seedIfEmpty();

  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/projects", async (_req, res) => {
    try {
      const list = await Project.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.post("/api/projects", adminAuth, async (req, res) => {
    try {
      const doc = await Project.create(req.body);
      res.status(201).json(doc);
    } catch (e) {
      res.status(400).json({ error: String(e.message) });
    }
  });

  app.put("/api/projects/:id", adminAuth, async (req, res) => {
    try {
      const doc = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (e) {
      res.status(400).json({ error: String(e.message) });
    }
  });

  app.delete("/api/projects/:id", adminAuth, async (req, res) => {
    try {
      const doc = await Project.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.get("/api/achievements", async (_req, res) => {
    try {
      const list = await Achievement.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.post("/api/achievements", adminAuth, async (req, res) => {
    try {
      const doc = await Achievement.create(req.body);
      res.status(201).json(doc);
    } catch (e) {
      res.status(400).json({ error: String(e.message) });
    }
  });

  app.put("/api/achievements/:id", adminAuth, async (req, res) => {
    try {
      const doc = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (e) {
      res.status(400).json({ error: String(e.message) });
    }
  });

  app.delete("/api/achievements/:id", adminAuth, async (req, res) => {
    try {
      const doc = await Achievement.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.get("/api/skills", (_req, res) => {
    try {
      const data = loadSiteContent();
      res.json(skillsForApi(data));
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.post("/api/skills", adminAuth, (req, res) => {
    try {
      const { name, value } = req.body || {};
      if (!name || String(name).trim() === "") {
        return res.status(400).json({ error: "name is required" });
      }
      const data = loadSiteContent();
      data.skills = normalizeSkills(data.skills);
      const id = `sk_${Date.now()}`;
      data.skills.push({
        id,
        name: String(name).trim(),
        value: Math.min(100, Math.max(0, Number(value) || 0)),
      });
      saveSiteContent(data);
      res.status(201).json({ _id: id, id, name: data.skills[data.skills.length - 1].name, value: data.skills[data.skills.length - 1].value });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.put("/api/skills/:id", adminAuth, (req, res) => {
    try {
      const data = loadSiteContent();
      data.skills = normalizeSkills(data.skills);
      const i = data.skills.findIndex((s) => s.id === req.params.id);
      if (i === -1) return res.status(404).json({ error: "Not found" });
      const { name, value } = req.body || {};
      if (name !== undefined) data.skills[i].name = String(name).trim() || data.skills[i].name;
      if (value !== undefined) data.skills[i].value = Math.min(100, Math.max(0, Number(value) || 0));
      saveSiteContent(data);
      const s = data.skills[i];
      res.json({ _id: s.id, id: s.id, name: s.name, value: s.value });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.delete("/api/skills/:id", adminAuth, (req, res) => {
    try {
      const data = loadSiteContent();
      data.skills = normalizeSkills(data.skills);
      const next = data.skills.filter((s) => s.id !== req.params.id);
      if (next.length === data.skills.length) return res.status(404).json({ error: "Not found" });
      data.skills = next;
      saveSiteContent(data);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.get("/api/profile", (_req, res) => {
    try {
      const data = loadSiteContent();
      const p = data.profile || {};
      res.json({
        _id: "site-content",
        key: "default",
        ...p,
      });
    } catch (e) {
      res.status(500).json({ error: "Edit server/data/site-content.json — file missing or invalid JSON." });
    }
  });

  app.post("/api/profile/verify-edit", (req, res) => {
    const editPassword = String((req.body || {}).editPassword ?? "").trim();
    if (editPassword !== PROFILE_EDIT_PASSWORD) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json({ ok: true });
  });

  app.put("/api/profile", (req, res) => {
    try {
      const { editPassword: pwdFromBody, ...rest } = req.body || {};
      const editPassword = String(pwdFromBody ?? "").trim();
      if (editPassword !== PROFILE_EDIT_PASSWORD) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const data = loadSiteContent();
      const nextProfile = { ...(data.profile || {}) };
      for (const k of PROFILE_KEYS) {
        if (rest[k] !== undefined) nextProfile[k] = rest[k];
      }
      data.profile = nextProfile;
      saveSiteContent(data);
      res.json({
        _id: "site-content",
        key: "default",
        ...data.profile,
      });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "name, email, subject, and message are required" });
      }
      await ContactMessage.create({ name, email, subject, message });
      res.status(201).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.get("/api/contact", adminAuth, async (_req, res) => {
    try {
      const list = await ContactMessage.find().sort({ createdAt: -1 }).limit(100).lean();
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: String(e.message) });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const sanitized = messages
      .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

    const lastUser = [...sanitized].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      return res.status(400).json({ error: "Include a user message" });
    }

    try {
      let siteContent;
      try {
        siteContent = loadSiteContent();
      } catch (e) {
        return res.status(500).json({
          error: "site-content.json missing or invalid. Check server/data/site-content.json.",
        });
      }

      const [projects, achievements] = await Promise.all([
        Project.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
        Achievement.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
      ]);

      const reply = answerFromPortfolioData(lastUser.content, {
        siteContent,
        projects,
        achievements,
      });

      res.json({ reply });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message || "Chat failed" });
    }
  });

  
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export default app;