import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Code2, Github, Linkedin, Mail, ArrowRight, Instagram } from "lucide-react";
import { Link } from "react-router";
import { ScrollTechStack } from "./ScrollTechStack";
import { apiJson } from "@/lib/api";
import type { ProjectDoc } from "@/lib/projectTypes";
import type { ProfileDoc } from "@/lib/siteTypes";
import { FALLBACK_PROFILE } from "@/lib/fallbackProfile";

export function Hero() {
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);

  const tagline = profile?.tagline?.trim() || FALLBACK_PROFILE.tagline;
  const displayName = profile?.fullName?.trim() || FALLBACK_PROFILE.fullName;
  const bio = profile?.bio?.trim() || FALLBACK_PROFILE.bio;
  const gh = profile?.githubUrl?.trim() || FALLBACK_PROFILE.githubUrl;
  const li = profile?.linkedinUrl?.trim() || FALLBACK_PROFILE.linkedinUrl;
  const ig = profile?.instagramUrl?.trim() || FALLBACK_PROFILE.instagramUrl;
  const expYears = profile?.experienceYears?.trim() || FALLBACK_PROFILE.experienceYears;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await apiJson<ProfileDoc>("/api/profile");
        if (!cancelled) setProfile(p);
      } catch {
        if (!cancelled) setProfile(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let index = 0;
    setText("");
    const timer = setInterval(() => {
      if (index <= tagline.length) {
        setText(tagline.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorTimer);
    };
  }, [tagline]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiJson<ProjectDoc[]>("/api/projects");
        if (!cancelled) setProjectCount(list.length);
      } catch {
        if (!cancelled) setProjectCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      label: "Projects",
      value: projectCount === null ? "—" : String(projectCount),
      color: "#00FFC2",
    },
    { label: "Experience", value: expYears, color: "#00E0FF" },
  ];

  const techStack = [
    {
      id: "react",
      name: "React",
      description: "Building dynamic, component-based user interfaces with modern React patterns and hooks for optimal performance.",
    },
    {
      id: "typescript",
      name: "TypeScript",
      description: "Writing type-safe code that catches errors early and improves developer experience with intelligent autocomplete.",
    },
    {
      id: "nodejs",
      name: "Node.js",
      description: "Creating scalable server-side applications with non-blocking I/O and efficient event-driven architecture.",
    },
    {
      id: "mongodb",
      name: "MongoDB",
      description: "Designing flexible NoSQL database schemas for high-performance data storage and retrieval at scale.",
    },
    {
      id: "express",
      name: "Express.js",
      description: "Developing robust RESTful APIs with middleware patterns and clean routing architecture.",
    },
    {
      id: "nextjs",
      name: "Next.js",
      description: "Leveraging server-side rendering and static site generation for blazing-fast, SEO-optimized web applications.",
    },
    {
      id: "tailwind",
      name: "Tailwind CSS",
      description: "Crafting beautiful, responsive designs with utility-first CSS for rapid UI development.",
    },
    {
      id: "git",
      name: "Git & GitHub",
      description: "Managing version control, collaborating on code, and maintaining clean commit histories for team success.",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Containerizing applications for consistent deployment across development, staging, and production environments.",
    },
    {
      id: "aws",
      name: "AWS",
      description: "Deploying and scaling cloud infrastructure with services like EC2, S3, Lambda, and CloudFront.",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid grid-cols-12 gap-4 sm:mb-12 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative col-span-12 overflow-hidden rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-6 shadow-[0_0_30px_rgba(0,255,194,0.15)] backdrop-blur-xl sm:p-8 lg:col-span-8"
          >
            <div className="absolute left-0 top-0 h-20 w-20 border-l-2 border-t-2 border-[#00FFC2] opacity-50" />
            <div className="absolute right-0 top-0 h-20 w-20 border-r-2 border-t-2 border-[#00E0FF] opacity-50" />
            <div className="absolute bottom-0 left-0 h-20 w-20 border-b-2 border-l-2 border-[#00E0FF] opacity-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-[#00FFC2] opacity-50" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-[#00FF00] shadow-[0_0_10px_#00FF00]" />
                <span className="font-mono text-sm text-[#00FFC2]">SYSTEM ONLINE</span>
              </div>

              <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent sm:text-5xl md:text-6xl">
                {displayName}
              </h1>

              <div className="mb-8 min-h-8 font-mono text-lg text-gray-300 sm:text-xl">
                {text}
                <span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`}>|</span>
              </div>

              <p className="mb-8 max-w-2xl leading-relaxed text-gray-400">{bio}</p>

              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  to="/lab"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-6 py-3 font-mono text-[#121212] transition-all hover:shadow-[0_0_25px_rgba(0,255,194,0.5)]"
                >
                  <span>VIEW PROJECTS</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] px-6 py-3 font-mono text-[#00FFC2] backdrop-blur-xl transition-all hover:bg-[rgba(0,255,194,0.1)]"
                >
                  <Mail className="h-4 w-4" />
                  <span>CONTACT</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-3">
                {gh ? (
                  <a
                    href={gh}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                ) : null}
                {li ? (
                  <a
                    href={li}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                ) : null}
                {ig ? (
                  <a
                    href={ig}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-12 flex min-h-[200px] items-center justify-center rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-8 shadow-[0_0_30px_rgba(0,255,194,0.15)] backdrop-blur-xl lg:col-span-4"
          >
            <motion.div
              animate={{ rotateY: 360, rotateX: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative h-32 w-32"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00FFC2] to-[#00E0FF] shadow-[0_0_40px_rgba(0,255,194,0.5)]">
                <Code2 className="h-16 w-16 text-[#121212]" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:mb-12 sm:gap-4 lg:grid-cols-2">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="rounded-xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-4 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_0_30px_rgba(0,255,194,0.2)] sm:p-6"
            >
              <div className="mb-2 text-2xl font-bold sm:text-4xl" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="font-mono text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <ScrollTechStack techStack={techStack} />
      </div>
    </div>
  );
}
