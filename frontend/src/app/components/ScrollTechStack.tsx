import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Tech {
  id: string;
  name: string;
  description: string;
}

interface ScrollTechStackProps {
  techStack: Tech[];
}

export function ScrollTechStack({ techStack }: ScrollTechStackProps) {
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const techRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      const viewportMiddle = window.innerHeight / 2;

      // Find which tech item is closest to the middle of the viewport
      let closestTech: string | null = null;
      let closestDistance = Infinity;

      Object.entries(techRefs.current).forEach(([id, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementMiddle = rect.top + rect.height / 2;
          const distance = Math.abs(elementMiddle - viewportMiddle);

          // Check if element is in viewport
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            if (distance < closestDistance) {
              closestDistance = distance;
              closestTech = id;
            }
          }
        }
      });

      setActiveTech(closestTech);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="mt-20">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-[#FFBE0B] animate-pulse shadow-[0_0_10px_#FFBE0B]" />
          <span className="font-mono text-sm text-[#FFBE0B]">TECHNOLOGY ARSENAL</span>
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-[#00FFC2] via-[#00E0FF] to-[#9D4EDD] bg-clip-text text-transparent">
          Tech Stack
        </h2>
      </motion.div>

      {/* Tech Stack Section - Each row has description on left and tech name on right */}
      <div className="space-y-4">
        {techStack.map((tech, index) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="grid grid-cols-12 gap-4 items-center"
          >
            {/* Left Side - Description (appears when active) */}
            <div className="col-span-12 lg:col-span-7">
              <AnimatePresence mode="wait">
                {activeTech === tech.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="backdrop-blur-xl bg-[rgba(30,30,30,0.6)] border border-[rgba(0,255,194,0.3)] rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,194,0.15)]"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00FFC2] to-[#00E0FF] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,194,0.4)]">
                        <span className="text-xl font-bold text-[#121212]">
                          {tech.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{tech.name}</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{tech.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side - Tech Name */}
            <div
              ref={(el) => {
                techRefs.current[tech.id] = el;
              }}
              className="col-span-12 lg:col-span-5"
            >
              <div
                className={`backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 ${
                  activeTech === tech.id
                    ? "bg-[rgba(0,255,194,0.15)] border-[#00FFC2] shadow-[0_0_25px_rgba(0,255,194,0.3)] scale-105"
                    : "bg-[rgba(30,30,30,0.6)] border-[rgba(0,255,194,0.2)] hover:border-[rgba(0,255,194,0.4)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xl transition-all duration-300 ${
                      activeTech === tech.id ? "text-white font-bold" : "text-gray-400"
                    }`}
                  >
                    {tech.name}
                  </span>
                  {activeTech === tech.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-[#00FFC2] shadow-[0_0_10px_#00FFC2]"
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add extra spacing at the end */}
      <div className="h-96" />
    </div>
  );
}