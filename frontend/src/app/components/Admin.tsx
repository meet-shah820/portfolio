import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Lock, Plus, Edit, Trash2, Save, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { apiJson } from "@/lib/api";
import type { ProjectDoc, ProjectStatus } from "@/lib/projectTypes";
import { AdminAchievementsSection, AdminProfileSection, AdminSkillsSection } from "./AdminSiteTabs";

function adminHeaders(): HeadersInit {
  const key = import.meta.env.VITE_ADMIN_KEY;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h["x-admin-key"] = key;
  return h;
}

export function Admin() {
  const [activeTab, setActiveTab] = useState("projects");
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectDoc | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiJson<ProjectDoc[]>("/api/projects");
      setProjects(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const tabs = [
    { id: "projects", label: "Projects" },
    { id: "achievements", label: "Achievements" },
    { id: "skills", label: "Skills" },
    { id: "profile", label: "Profile" },
  ];

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(p: ProjectDoc) {
    setEditing(p);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

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
            <div className="h-3 w-3 animate-pulse rounded-full bg-[#FF006E] shadow-[0_0_10px_#FF006E]" />
            <span className="font-mono text-sm text-[#FF006E]">ADMIN CONTROL PANEL</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent sm:text-5xl md:text-6xl">
                Admin Nexus
              </h1>
              <p className="text-base text-gray-400 sm:text-lg">
                Projects and achievements use MongoDB. Skills and profile are saved to{" "}
                <code className="rounded bg-black/30 px-1">server/data/site-content.json</code>. Profile editing
                requires the password set as <code className="rounded bg-black/30 px-1">PROFILE_EDIT_PASSWORD</code> on
                the server. Optional <code className="rounded bg-black/30 px-1">ADMIN_API_KEY</code>{" "}
                / <code className="rounded bg-black/30 px-1">VITE_ADMIN_KEY</code> for projects, achievements, and
                skills.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[rgba(255,0,110,0.3)] bg-[rgba(30,30,30,0.6)] px-4 py-2 backdrop-blur-xl">
              <Lock className="h-4 w-4 text-[#FF006E]" aria-hidden />
              <span className="font-mono text-sm text-[#FF006E]">PANEL</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                closeForm();
              }}
              className={`rounded-lg px-4 py-3 font-mono text-sm transition-all sm:px-6 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] text-[#121212] shadow-[0_0_20px_rgba(0,255,194,0.4)]"
                  : "border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] text-[#00FFC2] backdrop-blur-xl hover:bg-[rgba(0,255,194,0.1)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-5 shadow-[0_0_30px_rgba(0,255,194,0.15)] backdrop-blur-xl sm:p-8"
        >
          {activeTab === "achievements" && <AdminAchievementsSection />}
          {activeTab === "skills" && <AdminSkillsSection />}
          {activeTab === "profile" && <AdminProfileSection />}

          {activeTab === "projects" && (
            <>
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Manage projects</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void loadProjects()}
                    className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
                    REFRESH
                  </button>
                  <button
                    type="button"
                    onClick={() => (showForm ? closeForm() : openCreate())}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] transition-all hover:shadow-[0_0_20px_rgba(0,255,194,0.5)]"
                  >
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span>{showForm ? "CANCEL" : "ADD NEW"}</span>
                  </button>
                </div>
              </div>

              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-8 rounded-xl border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl sm:p-6"
                >
                  <h3 className="mb-6 text-lg font-bold text-white">
                    {editing ? "Edit project" : "Add project"}
                  </h3>
                  <ProjectForm
                    key={editing?._id ?? "new"}
                    initial={editing}
                    onCancel={closeForm}
                    onSaved={() => {
                      closeForm();
                      void loadProjects();
                      toast.success(editing ? "Project updated" : "Project created");
                    }}
                  />
                </motion.div>
              )}

              {loading && !showForm ? (
                <p className="text-gray-400">Loading…</p>
              ) : (
                <ul className="space-y-4">
                  {projects.map((p) => (
                    <li
                      key={p._id}
                      className="flex flex-col gap-3 rounded-lg border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-xl transition-all hover:border-[rgba(0,255,194,0.4)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-white">{p.title}</h4>
                        <p className="truncate font-mono text-sm text-gray-400">{p.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-lg border border-[rgba(0,224,255,0.3)] bg-[rgba(0,224,255,0.1)] p-2 text-[#00E0FF] transition-all hover:bg-[rgba(0,224,255,0.2)]"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <DeleteProjectButton id={p._id} title={p.title} onDone={() => void loadProjects()} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function DeleteProjectButton({ id, title, onDone }: { id: string; title: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!confirm(`Delete “${title}”?`)) return;
        setBusy(true);
        try {
          await apiJson(`/api/projects/${id}`, { method: "DELETE", headers: adminHeaders() });
          toast.success("Project deleted");
          onDone();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Delete failed");
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-lg border border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] p-2 text-[#ff4444] transition-all hover:bg-[rgba(255,68,68,0.2)] disabled:opacity-50"
      aria-label={`Delete ${title}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

type FormProps = {
  initial: ProjectDoc | null;
  onCancel: () => void;
  onSaved: () => void;
};

function ProjectForm({ initial, onCancel, onSaved }: FormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "Development");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tech, setTech] = useState((initial?.tech || []).join(", "));
  const [stars, setStars] = useState(String(initial?.stars ?? 0));
  const [forks, setForks] = useState(String(initial?.forks ?? 0));
  const [demoUrl, setDemoUrl] = useState(initial?.demoUrl ?? "");
  const [repoUrl, setRepoUrl] = useState(initial?.repoUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: title.trim(),
      status,
      description: description.trim(),
      tech: tech
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stars: Number(stars) || 0,
      forks: Number(forks) || 0,
      demoUrl: demoUrl.trim(),
      repoUrl: repoUrl.trim(),
    };
    try {
      if (initial) {
        await apiJson<ProjectDoc>(`/api/projects/${initial._id}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        await apiJson<ProjectDoc>("/api/projects", {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-title">
            Project title
          </label>
          <input
            id="pf-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white transition-all focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)]"
            placeholder="Title"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-status">
            Status
          </label>
          <select
            id="pf-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white transition-all focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)]"
          >
            <option value="Live">Live</option>
            <option value="Beta">Beta</option>
            <option value="Development">Development</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-desc">
          Description
        </label>
        <textarea
          id="pf-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white transition-all focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)]"
          placeholder="Description"
        />
      </div>
      <div>
        <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-tech">
          Tech stack (comma separated)
        </label>
        <input
          id="pf-tech"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white transition-all focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)]"
          placeholder="React, Node.js, MongoDB"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-stars">
            Stars
          </label>
          <input
            id="pf-stars"
            type="number"
            min={0}
            value={stars}
            onChange={(e) => setStars(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-forks">
            Forks
          </label>
          <input
            id="pf-forks"
            type="number"
            min={0}
            value={forks}
            onChange={(e) => setForks(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-demo">
            Demo URL
          </label>
          <input
            id="pf-demo"
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white"
            placeholder="https://"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-sm text-[#00FFC2]" htmlFor="pf-repo">
            Repository URL
          </label>
          <input
            id="pf-repo"
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-4 py-3 text-white"
            placeholder="https://github.com/..."
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-6 py-3 font-mono text-sm text-[#121212] transition-all hover:shadow-[0_0_20px_rgba(0,255,194,0.5)] disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden />
          {saving ? "SAVING…" : "SAVE"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[rgba(0,255,194,0.3)] px-6 py-3 font-mono text-sm text-[#00FFC2] hover:bg-[rgba(0,255,194,0.08)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
