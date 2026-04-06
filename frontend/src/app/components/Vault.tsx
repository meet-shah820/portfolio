import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, Trophy, Star, Shield, Zap, Target, Check, AlertCircle } from "lucide-react";
import { apiJson } from "@/lib/api";
import type { AchievementDoc } from "@/lib/siteTypes";

const ICON_MAP = {
  Shield,
  Trophy,
  Star,
  Zap,
  Target,
} as const;

export function Vault() {
  const [filter, setFilter] = useState("All");
  const [achievements, setAchievements] = useState<AchievementDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiJson<AchievementDoc[]>("/api/achievements");
        if (!cancelled) {
          setAchievements(list);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load");
          setAchievements([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(achievements.map((a) => a.category).filter(Boolean))),
  ];

  const filteredAchievements =
    filter === "All" ? achievements : achievements.filter((a) => a.category === filter);

  const stats = [
    { label: "Certifications", value: achievements.length, icon: Award },
    {
      label: "Categories",
      value: Math.max(0, categories.length - 1),
      icon: Target,
    },
    { label: "Active Learning", value: "100%", icon: Zap },
  ];

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-[#FFBE0B] shadow-[0_0_10px_#FFBE0B]" />
            <span className="font-mono text-sm text-[#FFBE0B]">ACHIEVEMENT SYSTEM</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            The Achievement Vault
          </h1>
          <p className="max-w-3xl text-base text-gray-400 sm:text-lg">
            Certifications and milestones are loaded from MongoDB (same data the site assistant uses).
          </p>
        </motion.div>

        {err && (
          <div
            className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-200"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm">{err}</p>
          </div>
        )}

        {loading && (
          <p className="mb-8 text-center text-gray-400">Loading achievements…</p>
        )}

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-6 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl"
              >
                <Icon className="mb-3 h-8 w-8 text-[#00FFC2]" />
                <div className="mb-1 text-3xl font-bold text-white">{stat.value}</div>
                <div className="font-mono text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 flex flex-wrap gap-3"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`rounded-lg px-4 py-2 font-mono text-sm transition-all ${
                filter === category
                  ? "bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] text-[#121212] shadow-[0_0_20px_rgba(0,255,194,0.4)]"
                  : "border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.05)] text-[#00FFC2] backdrop-blur-xl hover:bg-[rgba(0,255,194,0.1)]"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {!loading && achievements.length === 0 && !err && (
          <p className="mb-8 text-center text-gray-400">No achievements yet. Add them in Admin.</p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement, index) => {
            const Icon = ICON_MAP[achievement.iconKey] ?? Star;
            return (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-6 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,194,0.2)]"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20"
                  style={{
                    background: `radial-gradient(circle at center, ${achievement.color}, transparent)`,
                  }}
                />

                <div className="relative z-10">
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl shadow-[0_0_20px_currentColor]"
                      style={{ backgroundColor: achievement.color }}
                    >
                      <Icon className="h-7 w-7 text-[#121212]" />
                    </div>
                    <span
                      className="rounded-full border border-[rgba(0,255,194,0.3)] bg-[rgba(255,255,255,0.1)] px-3 py-1 font-mono text-xs backdrop-blur-xl"
                      style={{ color: achievement.color }}
                    >
                      {achievement.category}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-white">{achievement.title}</h3>
                  <p className="mb-3 text-sm text-gray-400">{achievement.issuer}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">{achievement.date}</span>
                    <div className="flex items-center gap-1 text-[#00FF00]">
                      <Check className="h-4 w-4" />
                      <span className="font-mono text-xs">Verified</span>
                    </div>
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
