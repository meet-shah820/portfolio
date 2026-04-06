import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { answerFromPortfolioData } from "../server/knowledge-chat.js";

/**
 * Vercel Serverless Function
 * - Keep everything at module scope (no app created inside an async main())
 * - Cache the Mongo connection across invocations
 * - Fall back gracefully when MONGODB_URI isn't configured
 */

const MONGODB_URI = process.env.MONGODB_URI;

const SITE_CONTENT_PATHS = [
  // Preferred (repo layout): /server/data/site-content.json
  path.join(process.cwd(), "server", "data", "site-content.json"),
  // Fallbacks for local experimentation
  path.join(process.cwd(), "data", "site-content.json"),
];

function loadSiteContent() {
  for (const p of SITE_CONTENT_PATHS) {
    try {
      const raw = fs.readFileSync(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // keep trying
    }
  }
  throw new Error("site-content.json missing or invalid");
}

function saveSiteContent(data) {
  const p = SITE_CONTENT_PATHS[0];
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function connectMongoIfConfigured() {
  if (!MONGODB_URI) return false;
  if (mongoose.connection.readyState === 1) return true;

  // Cache the connection promise in the global scope for serverless reuse.
  globalThis.__mongoConnPromise ||= mongoose.connect(MONGODB_URI);
  try {
    await globalThis.__mongoConnPromise;
    return true;
  } catch (e) {
    // If the first attempt fails, allow future invocations to retry.
    globalThis.__mongoConnPromise = null;
    console.error("Mongo connect failed:", e?.message || e);
    return false;
  }
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

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);

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
  if (!(await connectMongoIfConfigured())) return;
  if ((await Project.countDocuments()) === 0) {
    await Project.insertMany(SEED_PROJECTS);
  }
  if ((await Achievement.countDocuments()) === 0) {
    await Achievement.insertMany(SEED_ACHIEVEMENTS);
  }
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", async (_req, res) => {
  const mongo = await connectMongoIfConfigured();
  res.json({ ok: true, mongo: mongo ? "connected" : "not_configured" });
});

app.get("/api/projects", async (_req, res) => {
  try {
    const mongoOk = await connectMongoIfConfigured();
    if (!mongoOk) return res.json(SEED_PROJECTS);

    await seedIfEmpty();
    const list = await Project.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.post("/api/projects", adminAuth, async (req, res) => {
  try {
    const mongoOk = await connectMongoIfConfigured();
    if (!mongoOk) return res.status(503).json({ error: "MongoDB not configured in production (set MONGODB_URI on Vercel)" });
    const doc = await Project.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: String(e?.message || e) });
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
    const mongoOk = await connectMongoIfConfigured();
    if (!mongoOk) return res.json(SEED_ACHIEVEMENTS);

    await seedIfEmpty();
    const list = await Achievement.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
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

    const mongoOk = await connectMongoIfConfigured();
    if (!mongoOk) {
      // Don't break the UX in production if DB isn't set up yet.
      return res.status(202).json({ ok: true, stored: false });
    }

    await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ ok: true, stored: true });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
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
      const siteContent = loadSiteContent();

      const mongoOk = await connectMongoIfConfigured();
      const [projects, achievements] = mongoOk
        ? await Promise.all([
            (async () => {
              await seedIfEmpty();
              return Project.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
            })(),
            (async () => {
              await seedIfEmpty();
              return Achievement.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
            })(),
          ])
        : [SEED_PROJECTS, SEED_ACHIEVEMENTS];

      const reply = answerFromPortfolioData(lastUser.content, {
        siteContent,
        projects,
        achievements,
      });

      res.json({ reply });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e?.message || "Chat failed" });
    }
  });

// Vercel expects a default-exported handler. Express apps are (req, res) functions.
export default app;