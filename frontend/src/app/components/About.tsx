import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { User, Briefcase, GraduationCap, Code2, Rocket } from "lucide-react";
import { apiJson } from "@/lib/api";
import type { ProfileDoc } from "@/lib/siteTypes";
import { FALLBACK_PROFILE } from "@/lib/fallbackProfile";

const values = [
  {
    icon: Rocket,
    title: "Innovation First",
    description: "Constantly pushing boundaries and exploring new technologies to deliver cutting-edge solutions.",
  },
  {
    icon: Code2,
    title: "Clean Code",
    description: "Writing maintainable, scalable, and well-documented code that stands the test of time.",
  },
  {
    icon: User,
    title: "User-Centric",
    description: "Building with empathy, always keeping the end-user experience at the forefront.",
  },
];

export function About() {
  const [profile, setProfile] = useState<ProfileDoc | null>(null);

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

  const lead = profile?.aboutLead?.trim() || FALLBACK_PROFILE.aboutLead;
  const story = profile?.aboutStory?.length ? profile.aboutStory : [];
  const experience = profile?.experience?.length ? profile.experience : [];
  const education = profile?.education?.length ? profile.education : [];

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
            <div className="h-3 w-3 animate-pulse rounded-full bg-[#00E0FF] shadow-[0_0_10px_#00E0FF]" />
            <span className="font-mono text-sm text-[#00E0FF]">PROFILE INFORMATION</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            About Me
          </h1>
          <p className="max-w-3xl text-base text-gray-400 sm:text-lg">{lead}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-8 shadow-[0_0_30px_rgba(0,255,194,0.15)] backdrop-blur-xl"
        >
          <h2 className="mb-6 text-3xl font-bold text-[#00FFC2]">My Journey</h2>
          {story.length > 0 ? (
            <div className="space-y-4 leading-relaxed text-gray-300">
              {story.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Story content loads from server/data/site-content.json.</p>
          )}
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-6 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_0_30px_rgba(0,255,194,0.2)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#00FFC2] to-[#00E0FF] shadow-[0_0_20px_rgba(0,255,194,0.3)]">
                  <Icon className="h-6 w-6 text-[#121212]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{value.title}</h3>
                <p className="text-sm text-gray-400">{value.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-[#00FFC2]" />
            <h2 className="text-3xl font-bold text-[#00FFC2]">Experience</h2>
          </div>
          <div className="space-y-6">
            {experience.length === 0 ? (
              <p className="text-gray-500">No experience entries in the database yet.</p>
            ) : (
              experience.map((exp, index) => (
                <motion.div
                  key={`${exp.company}-${exp.title}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  className="relative rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-8 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_0_30px_rgba(0,255,194,0.2)]"
                >
                  <div className="absolute -left-3 top-8 h-6 w-6 rounded-full border-4 border-[#121212] bg-gradient-to-br from-[#00FFC2] to-[#00E0FF] shadow-[0_0_15px_rgba(0,255,194,0.5)]" />

                  <div className="mb-4 flex flex-col md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="mb-1 text-2xl font-bold text-white">{exp.title}</h3>
                      <p className="font-mono text-lg text-[#00E0FF]">{exp.company}</p>
                    </div>
                    <span className="mt-2 font-mono text-sm text-[#00FFC2] md:mt-0">{exp.period}</span>
                  </div>
                  <p className="mb-4 text-gray-300">{exp.description}</p>
                  <ul className="space-y-2">
                    {(exp.highlights ?? []).map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 text-gray-400">
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00FFC2]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }}>
          <div className="mb-6 flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-[#00FFC2]" />
            <h2 className="text-3xl font-bold text-[#00FFC2]">Education</h2>
          </div>
          <div className="rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] p-8 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl">
            {education.length === 0 ? (
              <p className="text-gray-500">No education entries in the database yet.</p>
            ) : (
              education.map((edu) => (
                <div key={edu.institution}>
                  <div className="mb-3 flex flex-col md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="mb-1 text-2xl font-bold text-white">{edu.degree}</h3>
                      <p className="font-mono text-lg text-[#00E0FF]">{edu.institution}</p>
                    </div>
                    <span className="mt-2 font-mono text-sm text-[#00FFC2] md:mt-0">{edu.period}</span>
                  </div>
                  <p className="text-gray-300">{edu.description}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
