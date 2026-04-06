import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Mail, MessageSquare, Send, Github, Linkedin, MapPin, Phone, Instagram } from "lucide-react";
import { toast } from "sonner";
import { apiJson } from "@/lib/api";
import type { ProfileDoc } from "@/lib/siteTypes";
import { FALLBACK_PROFILE } from "@/lib/fallbackProfile";

function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  if (digits.length === 10) return `tel:+1${digits}`;
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function Contact() {
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

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

  const p = useMemo(
    () => ({
      email: profile?.email?.trim() || FALLBACK_PROFILE.email,
      phone: profile?.phone?.trim() || FALLBACK_PROFILE.phone,
      location: profile?.location?.trim() || FALLBACK_PROFILE.location,
      githubUrl: profile?.githubUrl?.trim() || FALLBACK_PROFILE.githubUrl,
      linkedinUrl: profile?.linkedinUrl?.trim() || FALLBACK_PROFILE.linkedinUrl,
      instagramUrl: profile?.instagramUrl?.trim() || FALLBACK_PROFILE.instagramUrl,
      availability: profile?.availability ?? FALLBACK_PROFILE.availability!,
    }),
    [profile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiJson<{ ok: boolean }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("Message saved. I will get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: p.email,
      href: `mailto:${p.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: p.phone,
      href: phoneToTelHref(p.phone),
    },
    {
      icon: MapPin,
      label: "Location",
      value: p.location,
      href: null as string | null,
    },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: p.githubUrl,
      color: "#00FFC2",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: p.linkedinUrl,
      color: "#00E0FF",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: p.instagramUrl,
      color: "#E4405F",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-[#9D4EDD] shadow-[0_0_10px_#9D4EDD]" />
            <span className="font-mono text-sm text-[#9D4EDD]">GET IN TOUCH</span>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent sm:text-5xl md:text-6xl">
                Contact Me
              </h1>
              <p className="max-w-3xl text-base text-gray-400 sm:text-lg">
                Have a project in mind or want to collaborate? Feel free to reach out. I'm always excited to
                discuss new opportunities and innovative ideas.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="shrink-0 rounded-2xl border border-[rgba(0,255,194,0.35)] bg-[rgba(30,30,30,0.75)] p-5 shadow-[0_0_24px_rgba(0,255,194,0.12)] backdrop-blur-xl lg:max-w-xs lg:self-center"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-[#00FF00] shadow-[0_0_10px_#00FF00]" />
                <div>
                  <div className="font-bold text-white">{p.availability.title}</div>
                  <div className="text-sm text-gray-400">{p.availability.subtitle}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 backdrop-blur-xl bg-[rgba(30,30,30,0.6)] border border-[rgba(0,255,194,0.3)] rounded-2xl p-8 shadow-[0_0_30px_rgba(0,255,194,0.15)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-[#00FFC2]" />
              <h2 className="text-2xl font-bold text-white">Send a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-mono text-[#00FFC2] mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 backdrop-blur-xl bg-[rgba(30,30,30,0.8)] border border-[rgba(0,255,194,0.3)] rounded-lg text-white placeholder-gray-500 focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)] transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[#00FFC2] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 backdrop-blur-xl bg-[rgba(30,30,30,0.8)] border border-[rgba(0,255,194,0.3)] rounded-lg text-white placeholder-gray-500 focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)] transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-[#00FFC2] mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 backdrop-blur-xl bg-[rgba(30,30,30,0.8)] border border-[rgba(0,255,194,0.3)] rounded-lg text-white placeholder-gray-500 focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)] transition-all"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-[#00FFC2] mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 backdrop-blur-xl bg-[rgba(30,30,30,0.8)] border border-[rgba(0,255,194,0.3)] rounded-lg text-white placeholder-gray-500 focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.3)] transition-all resize-none"
                  placeholder="Tell me about your project or idea..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-6 py-3 font-mono text-[#121212] transition-all hover:shadow-[0_0_25px_rgba(0,255,194,0.5)] disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
                <span>{sending ? "SENDING…" : "SEND MESSAGE"}</span>
              </button>
            </form>
          </motion.div>

          {/* Contact Info & Social Links */}
          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="backdrop-blur-xl bg-[rgba(30,30,30,0.6)] border border-[rgba(0,255,194,0.3)] rounded-2xl p-6 shadow-[0_0_20px_rgba(0,255,194,0.1)]"
            >
              <h3 className="text-xl font-bold text-white mb-6">Contact Info</h3>
              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  const content = (
                    <div className="flex items-start gap-4 p-4 backdrop-blur-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,194,0.2)] rounded-lg hover:border-[rgba(0,255,194,0.4)] transition-all">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00FFC2] to-[#00E0FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#121212]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">{info.label}</div>
                        <div className="text-white font-mono text-sm">{info.value}</div>
                      </div>
                    </div>
                  );

                  return info.href ? (
                    <a key={info.label} href={info.href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={info.label}>{content}</div>
                  );
                })}
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="backdrop-blur-xl bg-[rgba(30,30,30,0.6)] border border-[rgba(0,255,194,0.3)] rounded-2xl p-6 shadow-[0_0_20px_rgba(0,255,194,0.1)]"
            >
              <h3 className="text-xl font-bold text-white mb-6">Follow Me</h3>
              <div className="space-y-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 backdrop-blur-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,194,0.2)] rounded-lg hover:border-[rgba(0,255,194,0.4)] hover:bg-[rgba(0,255,194,0.1)] transition-all group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${social.color}, ${social.color}99)`,
                        }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-mono text-sm group-hover:text-[#00FFC2] transition-colors">
                        {social.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
