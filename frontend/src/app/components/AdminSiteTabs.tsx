import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  PenLine,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Instagram,
  Briefcase,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { apiJson } from "@/lib/api";
import type {
  AchievementDoc,
  ProfileDoc,
  ProfileEducation,
  ProfileExperience,
  SkillDoc,
} from "@/lib/siteTypes";

function newRowId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type ExperienceFormRow = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  highlightsText: string;
};

type EducationFormRow = {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
};

function profileExperienceToRows(items: ProfileExperience[] | undefined): ExperienceFormRow[] {
  if (!items?.length) return [];
  return items.map((e, i) => ({
    id: newRowId(`exp-${i}`),
    title: e.title ?? "",
    company: e.company ?? "",
    period: e.period ?? "",
    description: e.description ?? "",
    highlightsText: (e.highlights ?? []).join("\n"),
  }));
}

function profileEducationToRows(items: ProfileEducation[] | undefined): EducationFormRow[] {
  if (!items?.length) return [];
  return items.map((e, i) => ({
    id: newRowId(`edu-${i}`),
    degree: e.degree ?? "",
    institution: e.institution ?? "",
    period: e.period ?? "",
    description: e.description ?? "",
  }));
}

function emptyExperienceRow(): ExperienceFormRow {
  return {
    id: newRowId("exp-new"),
    title: "",
    company: "",
    period: "",
    description: "",
    highlightsText: "",
  };
}

function emptyEducationRow(): EducationFormRow {
  return {
    id: newRowId("edu-new"),
    degree: "",
    institution: "",
    period: "",
    description: "",
  };
}

function rowsToExperience(rows: ExperienceFormRow[]): ProfileExperience[] {
  return rows
    .filter((r) =>
      [r.title, r.company, r.period, r.description, r.highlightsText].some((s) => String(s).trim()),
    )
    .map((r) => {
      const highlights = r.highlightsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        title: r.title.trim(),
        company: r.company.trim(),
        ...(r.period.trim() ? { period: r.period.trim() } : {}),
        ...(r.description.trim() ? { description: r.description.trim() } : {}),
        ...(highlights.length ? { highlights } : {}),
      };
    });
}

function rowsToEducation(rows: EducationFormRow[]): ProfileEducation[] {
  return rows
    .filter((r) =>
      [r.degree, r.institution, r.period, r.description].some((s) => String(s).trim()),
    )
    .map((r) => ({
      degree: r.degree.trim(),
      institution: r.institution.trim(),
      ...(r.period.trim() ? { period: r.period.trim() } : {}),
      ...(r.description.trim() ? { description: r.description.trim() } : {}),
    }));
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

function adminHeaders(): HeadersInit {
  const key = import.meta.env.VITE_ADMIN_KEY;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h["x-admin-key"] = key;
  return h;
}

const ICON_OPTIONS = ["Shield", "Trophy", "Star", "Zap", "Target"] as const;

export function AdminAchievementsSection() {
  const [list, setList] = useState<AchievementDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AchievementDoc | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList(await apiJson<AchievementDoc[]>("/api/achievements"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Manage achievements</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2] hover:bg-[rgba(0,255,194,0.1)]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
            REFRESH
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm((s) => !s);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212]"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "CANCEL" : "ADD NEW"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 rounded-xl border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] p-6"
        >
          <AchievementForm
            key={editing?._id ?? "new"}
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditing(null);
              void load();
              toast.success(editing ? "Updated" : "Created");
            }}
          />
        </motion.div>
      )}

      {loading && !showForm ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li
              key={a._id}
              className="flex flex-col gap-3 rounded-lg border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.05)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium text-white">{a.title}</div>
                <div className="font-mono text-sm text-gray-400">{a.category}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(a);
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-[rgba(0,224,255,0.3)] bg-[rgba(0,224,255,0.1)] p-2 text-[#00E0FF]"
                  aria-label={`Edit ${a.title}`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete “${a.title}”?`)) return;
                    try {
                      await apiJson(`/api/achievements/${a._id}`, {
                        method: "DELETE",
                        headers: adminHeaders(),
                      });
                      toast.success("Deleted");
                      void load();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                  className="rounded-lg border border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] p-2 text-[#ff4444]"
                  aria-label={`Delete ${a.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function AchievementForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: AchievementDoc | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [issuer, setIssuer] = useState(initial?.issuer ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [iconKey, setIconKey] = useState<(typeof ICON_OPTIONS)[number]>(
    initial?.iconKey && ICON_OPTIONS.includes(initial.iconKey as (typeof ICON_OPTIONS)[number])
      ? (initial.iconKey as (typeof ICON_OPTIONS)[number])
      : "Star"
  );
  const [color, setColor] = useState(initial?.color ?? "#00FFC2");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { title: title.trim(), issuer, date, category, iconKey, color };
    try {
      if (initial) {
        await apiJson(`/api/achievements/${initial._id}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        await apiJson("/api/achievements", {
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
    <form className="space-y-4" onSubmit={(e) => void submit(e)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Issuer</label>
          <input
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Date</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Icon</label>
          <select
            value={iconKey}
            onChange={(e) => setIconKey(e.target.value as (typeof ICON_OPTIONS)[number])}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          >
            {ICON_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Color (hex)</label>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden />
          SAVE
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2]">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AdminSkillsSection() {
  const [list, setList] = useState<SkillDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SkillDoc | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList(await apiJson<SkillDoc[]>("/api/skills"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Manage skills</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
            REFRESH
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm((s) => !s);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] transition-all hover:shadow-[0_0_20px_rgba(0,255,194,0.5)]"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{showForm ? "CANCEL" : "ADD NEW"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 rounded-xl border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] p-6"
        >
          <SkillForm
            key={editing?._id ?? "new"}
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditing(null);
              void load();
              toast.success(editing ? "Skill updated" : "Skill created");
            }}
          />
        </motion.div>
      )}

      {loading && !showForm ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <ul className="space-y-4">
          {list.map((s) => (
            <li
              key={s._id}
              className="flex flex-col gap-3 rounded-lg border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-xl transition-all hover:border-[rgba(0,255,194,0.4)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-white">{s.name}</h4>
                <p className="truncate font-mono text-sm text-gray-400">{s.value}% proficiency</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(s);
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-[rgba(0,224,255,0.3)] bg-[rgba(0,224,255,0.1)] p-2 text-[#00E0FF] transition-all hover:bg-[rgba(0,224,255,0.2)]"
                  aria-label={`Edit ${s.name}`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete skill “${s.name}”?`)) return;
                    try {
                      await apiJson(`/api/skills/${s._id}`, { method: "DELETE", headers: adminHeaders() });
                      toast.success("Deleted");
                      void load();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                  className="rounded-lg border border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] p-2 text-[#ff4444]"
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function SkillForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: SkillDoc | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [value, setValue] = useState(String(initial?.value ?? 80));
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { name: name.trim(), value: Math.min(100, Math.max(0, Number(value) || 0)) };
    try {
      if (initial) {
        await apiJson(`/api/skills/${initial._id}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        await apiJson("/api/skills", { method: "POST", headers: adminHeaders(), body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void submit(e)}>
      <h3 className="text-lg font-bold text-white">{initial ? "Edit skill" : "Add skill"}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Skill name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Proficiency (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden />
          SAVE
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProfileReadOnlyView({ profile }: { profile: ProfileDoc }) {
  const social = [
    { label: "GitHub", url: profile.githubUrl, Icon: Github },
    { label: "LinkedIn", url: profile.linkedinUrl, Icon: Linkedin },
    { label: "Instagram", url: profile.instagramUrl, Icon: Instagram },
  ].filter((s) => s.url?.trim());

  return (
    <div className="space-y-6">
      <section
        className="rounded-xl border border-[rgba(0,255,194,0.25)] bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur-xl"
        aria-labelledby="admin-profile-hero"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h3 id="admin-profile-hero" className="text-2xl font-bold text-white sm:text-3xl">
              {profile.fullName || "—"}
            </h3>
            <p className="mt-2 text-base text-gray-300 sm:text-lg">{profile.tagline || "—"}</p>
          </div>
          {profile.experienceYears ? (
            <span className="shrink-0 rounded-lg border border-[rgba(0,255,194,0.35)] bg-[rgba(0,255,194,0.08)] px-4 py-2 font-mono text-sm text-[#00FFC2]">
              {profile.experienceYears} experience
            </span>
          ) : null}
        </div>
        {profile.bio ? <p className="mt-5 text-gray-400 leading-relaxed">{profile.bio}</p> : null}
      </section>

      <section
        className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.03)] p-6"
        aria-labelledby="admin-profile-contact"
      >
        <h4 id="admin-profile-contact" className="mb-4 font-mono text-sm text-[#00FFC2]">
          Contact & links
        </h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {profile.email ? (
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00E0FF]" aria-hidden />
              <a href={`mailto:${profile.email}`} className="break-all text-[#00E0FF] hover:underline">
                {profile.email}
              </a>
            </li>
          ) : null}
          {profile.phone ? (
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00E0FF]" aria-hidden />
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="text-[#00E0FF] hover:underline">
                {profile.phone}
              </a>
            </li>
          ) : null}
          {profile.location ? (
            <li className="flex items-start gap-3 text-sm text-gray-300 sm:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00E0FF]" aria-hidden />
              <span>{profile.location}</span>
            </li>
          ) : null}
        </ul>
        {social.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {social.map(({ label, url, Icon }) => (
              <li key={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,224,255,0.25)] bg-[rgba(0,224,255,0.06)] px-3 py-2 font-mono text-xs text-[#00E0FF] transition-colors hover:bg-[rgba(0,224,255,0.12)]"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                  <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {profile.availability?.title || profile.availability?.subtitle ? (
        <section
          className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.03)] p-6"
          aria-labelledby="admin-profile-availability"
        >
          <h4 id="admin-profile-availability" className="mb-2 font-mono text-sm text-[#00FFC2]">
            Availability
          </h4>
          <p className="text-lg font-medium text-white">{profile.availability?.title || "—"}</p>
          {profile.availability?.subtitle ? (
            <p className="mt-1 text-gray-400">{profile.availability.subtitle}</p>
          ) : null}
        </section>
      ) : null}

      {profile.aboutLead || (profile.aboutStory && profile.aboutStory.length > 0) ? (
        <section
          className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.03)] p-6"
          aria-labelledby="admin-profile-about"
        >
          <h4 id="admin-profile-about" className="mb-4 font-mono text-sm text-[#00FFC2]">
            About (site)
          </h4>
          {profile.aboutLead ? <p className="text-gray-200 leading-relaxed">{profile.aboutLead}</p> : null}
          {profile.aboutStory && profile.aboutStory.length > 0 ? (
            <div className={profile.aboutLead ? "mt-5 space-y-4 border-t border-[rgba(0,255,194,0.15)] pt-5" : "space-y-4"}>
              {profile.aboutStory.map((para, i) => (
                <p key={i} className="text-gray-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {profile.experience && profile.experience.length > 0 ? (
        <section className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.03)] p-6" aria-labelledby="admin-profile-exp">
          <h4 id="admin-profile-exp" className="mb-4 flex items-center gap-2 font-mono text-sm text-[#00FFC2]">
            <Briefcase className="h-4 w-4" aria-hidden />
            Experience
          </h4>
          <ul className="space-y-5">
            {profile.experience.map((job, i) => (
              <li
                key={`${job.company}-${job.title}-${i}`}
                className="rounded-lg border border-[rgba(0,255,194,0.12)] bg-[rgba(0,0,0,0.2)] p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{job.title}</p>
                    <p className="text-sm text-[#00E0FF]">{job.company}</p>
                  </div>
                  {job.period ? (
                    <p className="font-mono text-xs text-gray-500">{job.period}</p>
                  ) : null}
                </div>
                {job.description ? <p className="mt-3 text-sm text-gray-400 leading-relaxed">{job.description}</p> : null}
                {job.highlights && job.highlights.length > 0 ? (
                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-400">
                    {job.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.education && profile.education.length > 0 ? (
        <section className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(255,255,255,0.03)] p-6" aria-labelledby="admin-profile-edu">
          <h4 id="admin-profile-edu" className="mb-4 flex items-center gap-2 font-mono text-sm text-[#00FFC2]">
            <GraduationCap className="h-4 w-4" aria-hidden />
            Education
          </h4>
          <ul className="space-y-4">
            {profile.education.map((ed, i) => (
              <li
                key={`${ed.institution}-${ed.degree}-${i}`}
                className="rounded-lg border border-[rgba(0,255,194,0.12)] bg-[rgba(0,0,0,0.2)] p-4"
              >
                <p className="font-semibold text-white">{ed.degree}</p>
                <p className="text-sm text-[#00E0FF]">{ed.institution}</p>
                {ed.period ? <p className="mt-1 font-mono text-xs text-gray-500">{ed.period}</p> : null}
                {ed.description ? <p className="mt-2 text-sm text-gray-400 leading-relaxed">{ed.description}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function AdminProfileSection() {
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPassword, setEditPassword] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await apiJson<ProfileDoc>("/api/profile"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (passwordDialogOpen) {
      setPasswordDraft("");
      const t = window.setTimeout(() => passwordInputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [passwordDialogOpen]);

  async function submitPasswordAndEnterEdit() {
    const trimmed = passwordDraft.trim();
    if (!trimmed) {
      toast.error("Password required");
      return;
    }
    setUnlocking(true);
    try {
      try {
        await apiJson<{ ok: boolean }>("/api/profile/verify-edit", {
          method: "POST",
          body: JSON.stringify({ editPassword: trimmed }),
        });
      } catch {
        toast.error("Incorrect password");
        return;
      }
      setPasswordDialogOpen(false);
      setPasswordDraft("");
      const p = await apiJson<ProfileDoc>("/api/profile");
      setProfile(p);
      setEditPassword(trimmed);
      setEditMode(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load profile for editing");
    } finally {
      setUnlocking(false);
    }
  }

  function exitEditMode() {
    setEditMode(false);
    setEditPassword(null);
  }

  return (
    <>
      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) setPasswordDraft("");
        }}
      >
        <DialogContent className="border border-[rgba(0,255,194,0.35)] bg-[#161616] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit profile</DialogTitle>
            <DialogDescription className="text-gray-400">Enter password.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submitPasswordAndEnterEdit();
            }}
          >
            <input
              ref={passwordInputRef}
              type="password"
              autoComplete="current-password"
              value={passwordDraft}
              onChange={(e) => setPasswordDraft(e.target.value)}
              className="w-full rounded-lg border border-[rgba(0,255,194,0.35)] bg-[rgba(30,30,30,0.95)] px-4 py-3 text-white placeholder:text-gray-600 focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.25)]"
              placeholder=""
              aria-label="Password"
            />
            <DialogFooter className="gap-2 sm:gap-2">
              <button
                type="button"
                onClick={() => setPasswordDialogOpen(false)}
                className="rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2] hover:bg-[rgba(0,255,194,0.08)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={unlocking}
                className="rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] disabled:opacity-50"
              >
                {unlocking ? "…" : "Continue"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Profile</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Full site profile from <span className="font-mono text-gray-400">site-content.json</span>. Edit mode is
            password-protected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || unlocking}
            className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.3)] px-4 py-2 font-mono text-sm text-[#00FFC2] transition-all hover:bg-[rgba(0,255,194,0.1)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
            REFRESH
          </button>
          <button
            type="button"
            disabled={unlocking}
            onClick={() => {
              if (editMode) exitEditMode();
              else setPasswordDialogOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-sm text-[#121212] transition-all hover:shadow-[0_0_20px_rgba(0,255,194,0.5)] disabled:opacity-50"
          >
            {editMode ? <X className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
            <span>{editMode ? "CANCEL" : unlocking ? "…" : "EDIT PROFILE"}</span>
          </button>
        </div>
      </div>

      {loading && !editMode ? (
        <p className="text-gray-400">Loading…</p>
      ) : profile && !editMode ? (
        <ProfileReadOnlyView profile={profile} />
      ) : !profile && !editMode ? (
        <p className="text-gray-400">Could not load profile. Check the API and try Refresh.</p>
      ) : null}

      {editMode && profile && editPassword ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-xl border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] p-6"
        >
          <ProfileEditForm
            key={profile._id}
            profile={profile}
            editPassword={editPassword}
            onCancel={exitEditMode}
            onSaved={() => {
              exitEditMode();
              void load();
              toast.success("Profile saved");
            }}
          />
        </motion.div>
      ) : null}
    </>
  );
}

function ProfileEditForm({
  profile,
  editPassword,
  onCancel,
  onSaved,
}: {
  profile: ProfileDoc;
  editPassword: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [tagline, setTagline] = useState(profile.tagline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl ?? "");
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears ?? "");
  const [aboutLead, setAboutLead] = useState(profile.aboutLead ?? "");
  const [aboutStoryText, setAboutStoryText] = useState((profile.aboutStory ?? []).join("\n\n"));
  const [experienceRows, setExperienceRows] = useState<ExperienceFormRow[]>(() =>
    profileExperienceToRows(profile.experience),
  );
  const [educationRows, setEducationRows] = useState<EducationFormRow[]>(() =>
    profileEducationToRows(profile.education),
  );
  const [availTitle, setAvailTitle] = useState(profile.availability?.title ?? "");
  const [availSubtitle, setAvailSubtitle] = useState(profile.availability?.subtitle ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const experience = rowsToExperience(experienceRows);
    const education = rowsToEducation(educationRows);
    const aboutStory = aboutStoryText
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await apiJson<ProfileDoc>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          editPassword,
          fullName: fullName.trim(),
          tagline: tagline.trim(),
          bio: bio.trim(),
          email: email.trim(),
          phone: phone.trim(),
          location: location.trim(),
          githubUrl: githubUrl.trim(),
          linkedinUrl: linkedinUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          experienceYears: experienceYears.trim(),
          aboutLead: aboutLead.trim(),
          aboutStory,
          experience,
          education,
          availability: {
            title: availTitle.trim() || "Available for Work",
            subtitle: availSubtitle.trim() || "",
          },
        }),
      });
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("401")) {
        onCancel();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => void submit(e)}>
      <p className="text-sm text-gray-400">Changes are written to server/data/site-content.json.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField label="Full name" value={fullName} onChange={setFullName} />
        <ProfileField label="Experience stat (e.g. 5Y)" value={experienceYears} onChange={setExperienceYears} />
        <div className="md:col-span-2">
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Short bio (hero)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <ProfileField label="Email" value={email} onChange={setEmail} />
        <ProfileField label="Phone" value={phone} onChange={setPhone} />
        <ProfileField label="Location" value={location} onChange={setLocation} className="md:col-span-2" />
        <ProfileField label="GitHub URL" value={githubUrl} onChange={setGithubUrl} />
        <ProfileField label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} />
        <ProfileField label="Instagram URL" value={instagramUrl} onChange={setInstagramUrl} className="md:col-span-2" />
        <ProfileField label="Availability title" value={availTitle} onChange={setAvailTitle} />
        <ProfileField label="Availability subtitle" value={availSubtitle} onChange={setAvailSubtitle} />
        <div className="md:col-span-2">
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">About page lead</label>
          <textarea
            value={aboutLead}
            onChange={(e) => setAboutLead(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-mono text-sm text-[#00FFC2]">About story (paragraphs, blank line between)</label>
          <textarea
            value={aboutStoryText}
            onChange={(e) => setAboutStoryText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-sm leading-relaxed text-white"
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 font-mono text-sm text-[#00FFC2]">
              <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
              Experience
            </span>
            <button
              type="button"
              onClick={() => setExperienceRows((rows) => [...rows, emptyExperienceRow()])}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.35)] px-3 py-2 font-mono text-xs text-[#00FFC2] hover:bg-[rgba(0,255,194,0.08)]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add job
            </button>
          </div>
          {experienceRows.length === 0 ? (
            <p className="text-sm text-gray-500">No roles yet. Use “Add job” to add one.</p>
          ) : (
            <ul className="space-y-4">
              {experienceRows.map((row, index) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(0,0,0,0.25)] p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">Job {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setExperienceRows((rows) => rows.filter((r) => r.id !== row.id))}
                      className="rounded-lg border border-[rgba(255,68,68,0.35)] p-2 text-[#ff6b6b] hover:bg-[rgba(255,68,68,0.1)]"
                      aria-label={`Remove job ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ProfileField
                      label="Job title"
                      value={row.title}
                      onChange={(v) =>
                        setExperienceRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, title: v } : r)),
                        )
                      }
                    />
                    <ProfileField
                      label="Company"
                      value={row.company}
                      onChange={(v) =>
                        setExperienceRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, company: v } : r)),
                        )
                      }
                    />
                    <ProfileField
                      label="Time period (e.g. 2024 – Present)"
                      value={row.period}
                      onChange={(v) =>
                        setExperienceRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, period: v } : r)),
                        )
                      }
                      className="md:col-span-2"
                    />
                    <div className="md:col-span-2">
                      <label className="mb-1 block font-mono text-sm text-[#00FFC2]">What you did (summary)</label>
                      <textarea
                        value={row.description}
                        onChange={(e) =>
                          setExperienceRows((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)),
                          )
                        }
                        rows={3}
                        className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-sm leading-relaxed text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block font-mono text-sm text-[#00FFC2]">
                        Key achievements (one per line)
                      </label>
                      <textarea
                        value={row.highlightsText}
                        onChange={(e) =>
                          setExperienceRows((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, highlightsText: e.target.value } : r)),
                          )
                        }
                        rows={4}
                        placeholder={"Shipped the new dashboard\nCut load time in half"}
                        className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-sm leading-relaxed text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 font-mono text-sm text-[#00FFC2]">
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
              Education
            </span>
            <button
              type="button"
              onClick={() => setEducationRows((rows) => [...rows, emptyEducationRow()])}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,255,194,0.35)] px-3 py-2 font-mono text-xs text-[#00FFC2] hover:bg-[rgba(0,255,194,0.08)]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add school
            </button>
          </div>
          {educationRows.length === 0 ? (
            <p className="text-sm text-gray-500">No entries yet. Use “Add school” to add one.</p>
          ) : (
            <ul className="space-y-4">
              {educationRows.map((row, index) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-[rgba(0,255,194,0.2)] bg-[rgba(0,0,0,0.25)] p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">School {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setEducationRows((rows) => rows.filter((r) => r.id !== row.id))}
                      className="rounded-lg border border-[rgba(255,68,68,0.35)] p-2 text-[#ff6b6b] hover:bg-[rgba(255,68,68,0.1)]"
                      aria-label={`Remove school ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ProfileField
                      label="Degree or program"
                      value={row.degree}
                      onChange={(v) =>
                        setEducationRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, degree: v } : r)))
                      }
                      className="md:col-span-2"
                    />
                    <ProfileField
                      label="School or institution"
                      value={row.institution}
                      onChange={(v) =>
                        setEducationRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, institution: v } : r)),
                        )
                      }
                      className="md:col-span-2"
                    />
                    <ProfileField
                      label="Years (e.g. 2017 – 2021)"
                      value={row.period}
                      onChange={(v) =>
                        setEducationRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, period: v } : r)))
                      }
                      className="md:col-span-2"
                    />
                    <div className="md:col-span-2">
                      <label className="mb-1 block font-mono text-sm text-[#00FFC2]">Notes (focus, honors, etc.)</label>
                      <textarea
                        value={row.description}
                        onChange={(e) =>
                          setEducationRows((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)),
                          )
                        }
                        rows={3}
                        className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-sm leading-relaxed text-white"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-6 py-3 font-mono text-sm text-[#121212] disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden />
          SAVE PROFILE
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[rgba(0,255,194,0.3)] px-6 py-3 font-mono text-sm text-[#00FFC2]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-mono text-sm text-[#00FFC2]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.8)] px-3 py-2 text-white"
      />
    </div>
  );
}
