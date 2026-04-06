/**
 * Answers questions using only local JSON site content + MongoDB (projects, achievements).
 * No external APIs.
 */

const STOP = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "and",
  "but",
  "if",
  "or",
  "because",
  "until",
  "while",
  "about",
  "against",
  "between",
  "into",
  "through",
  "this",
  "that",
  "these",
  "those",
  "am",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "what",
  "which",
  "who",
  "whom",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "give",
  "tell",
  "want",
  "know",
  "like",
  "get",
  "got",
  "please",
]);

function tokens(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function formatContact(p) {
  const lines = [
    `Contact`,
    `Email: ${p.email || "—"}`,
    `Phone: ${p.phone || "—"}`,
    `Location: ${p.location || "—"}`,
    p.githubUrl && `GitHub: ${p.githubUrl}`,
    p.linkedinUrl && `LinkedIn: ${p.linkedinUrl}`,
    p.instagramUrl && `Instagram: ${p.instagramUrl}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function formatExperience(experience) {
  if (!experience?.length) return "No work experience is listed in the site content file.";
  return experience
    .map(
      (e) =>
        `${e.title} at ${e.company} (${e.period || "dates n/a"})\n${e.description || ""}\n${(e.highlights || []).map((h) => `• ${h}`).join("\n")}`
    )
    .join("\n\n");
}

function formatEducation(education) {
  if (!education?.length) return "No education entries are listed in the site content file.";
  return education
    .map(
      (ed) =>
        `${ed.degree} — ${ed.institution} (${ed.period || ""})\n${ed.description || ""}`
    )
    .join("\n\n");
}

function formatSkills(skills) {
  if (!skills?.length) return "No skills are listed in site-content.json.";
  return (
    "Skills (from site content)\n" +
    skills.map((s) => `• ${s.name}: ${s.value}% proficiency`).join("\n")
  );
}

function formatProjects(projects) {
  if (!projects?.length) return "There are no projects in the database yet.";
  return projects
    .map(
      (p) =>
        `${p.title} [${p.status}]\n${p.description || ""}\nTech: ${(p.tech || []).join(", ") || "—"}\nDemo: ${p.demoUrl || "—"} | Repo: ${p.repoUrl || "—"}`
    )
    .join("\n\n");
}

function formatAchievements(achievements) {
  if (!achievements?.length) return "There are no achievements in the database yet.";
  return achievements
    .map((a) => `${a.title} — ${a.issuer} (${a.date}) [${a.category}]`)
    .join("\n");
}

function formatAvailability(p) {
  const a = p.availability || {};
  return `${a.title || "Availability"}\n${a.subtitle || ""}`;
}

function buildSiteBrief(profile, projects, achievements, skills) {
  const p = profile || {};
  return [
    `${p.fullName || "Portfolio"} — ${p.tagline || ""}`,
    "",
    p.bio || "",
    "",
    `Pages: Home (HUD), About, Lab (${projects?.length || 0} projects), Vault (${achievements?.length || 0} achievements), Contact.`,
    "",
    "Contact (from site content):",
    formatContact(p),
    "",
    "Skills (from site content):",
    (skills || []).map((s) => s.name).join(", ") || "—",
  ].join("\n");
}

function keywordSearch(qTokens, projects, achievements, profile, skills) {
  const chunks = [];

  const p = profile || {};
  chunks.push({
    score: 0,
    text: `${p.fullName} ${p.tagline} ${p.bio}`,
    label: "Profile",
  });
  chunks.push({ score: 0, text: formatContact(p), label: "Contact" });
  chunks.push({ score: 0, text: formatExperience(p.experience), label: "Experience" });
  chunks.push({ score: 0, text: formatEducation(p.education), label: "Education" });
  chunks.push({ score: 0, text: (p.aboutStory || []).join(" "), label: "About story" });
  chunks.push({ score: 0, text: formatSkills(skills), label: "Skills" });

  for (const proj of projects || []) {
    const text = `${proj.title} ${proj.description} ${(proj.tech || []).join(" ")}`;
    chunks.push({ score: 0, text, label: `Project: ${proj.title}` });
  }
  for (const a of achievements || []) {
    const text = `${a.title} ${a.issuer} ${a.category}`;
    chunks.push({ score: 0, text, label: `Achievement: ${a.title}` });
  }

  for (const ch of chunks) {
    const hay = ch.text.toLowerCase();
    for (const t of qTokens) {
      if (t.length > 2 && hay.includes(t)) ch.score += 1;
    }
  }

  chunks.sort((a, b) => b.score - a.score);
  const top = chunks.filter((c) => c.score > 0).slice(0, 3);
  if (top.length === 0) return null;

  return (
    "Here is what I found on this site that may match your question:\n\n" +
    top.map((c) => `${c.label}\n${c.text}`).join("\n\n---\n\n")
  );
}

export function answerFromPortfolioData(userText, { siteContent, projects, achievements }) {
  const profile = siteContent?.profile || {};
  const skills = siteContent?.skills || [];
  const q = String(userText || "").trim();
  const qLower = q.toLowerCase();

  if (!q) {
    return "Ask about projects, contact info, experience, education, certifications, or skills — I only use data from this site and the database.";
  }

  if (/^(hi|hello|hey|good (morning|afternoon|evening)|thanks|thank you)\b/i.test(q)) {
    return `Hi! I'm the on-site assistant for ${profile.fullName || "this portfolio"}. I answer from \`server/data/site-content.json\` (profile, story, experience, education, skills) and from MongoDB (projects and achievements). What would you like to know?`;
  }

  if (
    /\b(brief|overview|summary|what is this|about this (site|website)|tell me about (the )?(site|website)|describe (the )?(site|website))\b/i.test(
      qLower
    )
  ) {
    return buildSiteBrief(profile, projects, achievements, skills);
  }

  if (/\b(contact|email|phone|reach|linkedin|github|instagram|mailto)\b/i.test(qLower)) {
    return formatContact(profile);
  }

  if (/\b(who is|who's|about (him|her|the developer|the owner)|your name|full name)\b/i.test(qLower)) {
    return `${profile.fullName || "—"}\n${profile.tagline || ""}\n\n${profile.bio || ""}`;
  }

  if (/\b(experience|work history|employment|job|career|pilotmvp|worked at)\b/i.test(qLower)) {
    return formatExperience(profile.experience);
  }

  if (/\b(education|degree|university|college|studied|graduated)\b/i.test(qLower)) {
    return formatEducation(profile.education);
  }

  if (/\b(skill|skills|stack|technologies|tech stack|proficien|mern)\b/i.test(qLower)) {
    return formatSkills(skills);
  }

  if (/\b(project|projects|lab|bento|built|demo|repository|repo)\b/i.test(qLower)) {
    return formatProjects(projects);
  }

  if (/\b(cert|certificate|achievement|achievements|vault|credential)\b/i.test(qLower)) {
    return formatAchievements(achievements);
  }

  if (/\b(hire|available|availability|open to|opportunit|freelance|work with)\b/i.test(qLower)) {
    return formatAvailability(profile);
  }

  if (/\b(story|journey|about me|background)\b/i.test(qLower)) {
    const s = profile.aboutStory || [];
    if (!s.length) return "The about story is empty in site-content.json.";
    return "About\n\n" + s.join("\n\n");
  }

  const qt = tokens(q);
  const specificProject = (projects || []).find((p) => {
    const title = (p.title || "").toLowerCase();
    return title && qt.some((t) => t.length > 3 && title.includes(t));
  });
  if (specificProject) {
    return formatProjects([specificProject]);
  }

  const fb = keywordSearch(qt, projects, achievements, profile, skills);
  if (fb) return fb;

  return `I don't have a specific match for that. I only use server/data/site-content.json (profile, contact, about, experience, education, skills) and MongoDB (projects, achievements). Try: brief overview, contact details, projects, certifications, or work experience.`;
}
