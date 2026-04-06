import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Github, Play, Star, GitBranch, AlertCircle } from "lucide-react";
import { apiJson } from "@/lib/api";
import type { ProjectDoc } from "@/lib/projectTypes";

export function Lab() {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiJson<ProjectDoc[]>("/api/projects");
        if (!cancelled) {
          setProjects(list);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load projects");
          setProjects([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-[#00FF00] text-[#121212]";
      case "Beta":
        return "bg-[#FFBE0B] text-[#121212]";
      case "Development":
        return "bg-[#00E0FF] text-[#121212]";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-[#00E0FF] shadow-[0_0_10px_#00E0FF]" />
            <span className="font-mono text-sm text-[#00E0FF]">PROJECT LABORATORY</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            The Bento Lab
          </h1>
          <p className="max-w-3xl text-base text-gray-400 sm:text-lg">
            Projects are loaded from MongoDB. Add or edit them in Admin — updates appear here and in the
            site assistant automatically.
          </p>
        </motion.div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(0,255,194,0.2)] bg-[rgba(30,30,30,0.5)] p-8 text-center text-gray-400">
            Loading projects…
          </div>
        )}

        {!loading && err && (
          <div
            className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-200"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">Could not load projects</p>
              <p className="mt-1 text-sm opacity-90">{err}</p>
              <p className="mt-2 text-sm text-gray-400">
                Start the API server and MongoDB, then run <code className="rounded bg-black/40 px-1">npm run dev:full</code> from
                the frontend folder.
              </p>
            </div>
          </div>
        )}

        {!loading && !err && projects.length === 0 && (
          <div className="rounded-2xl border border-[rgba(0,255,194,0.2)] bg-[rgba(30,30,30,0.5)] p-8 text-center text-gray-400">
            No projects yet. Open <strong className="text-[#00FFC2]">Admin</strong> to add your first project.
          </div>
        )}

        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {projects.map((project, index) => {
            const span = project.span || "col-span-12 lg:col-span-6";
            const gradient = project.gradient || "from-[#00FFC2] to-[#00E0FF]";
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.06 }}
                className={`${span} group relative overflow-hidden rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-5 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_0_40px_rgba(0,255,194,0.2)] sm:p-6`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />

                <div className="relative z-10">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">{project.title}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                    <span
                      className={`shrink-0 self-start rounded-full px-3 py-1 font-mono text-xs ${getStatusColor(
                        project.status
                      )} shadow-[0_0_10px_currentColor]`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {(project.tech || []).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] px-3 py-1 font-mono text-xs text-[#00FFC2] backdrop-blur-xl"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" aria-hidden />
                      <span className="font-mono text-sm">{project.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4" aria-hidden />
                      <span className="font-mono text-sm">{project.forks}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {project.demoUrl ? (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] transition-all hover:shadow-[0_0_20px_rgba(0,255,194,0.5)]"
                      >
                        <Play className="h-4 w-4" aria-hidden />
                        <span>VIEW DEMO</span>
                      </a>
                    ) : (
                      <span className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.2)] px-4 py-2 font-mono text-sm text-gray-500">
                        <Play className="h-4 w-4" aria-hidden />
                        <span>NO DEMO URL</span>
                      </span>
                    )}
                    {project.repoUrl ? (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] px-4 py-2 font-mono text-sm text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
                      >
                        <Github className="h-4 w-4" aria-hidden />
                        <span>CODE</span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.15)] px-4 py-2 font-mono text-sm text-gray-500">
                        <Github className="h-4 w-4" aria-hidden />
                        <span>NO REPO</span>
                      </span>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded-lg border border-[rgba(0,255,194,0.3)] p-2 text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
                        aria-label="Open project link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
