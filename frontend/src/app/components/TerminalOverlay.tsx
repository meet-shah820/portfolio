import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { X, ChevronRight } from "lucide-react";

interface TerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TerminalOverlay({ isOpen, onClose }: TerminalOverlayProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "DEV.NEXUS Terminal v1.0.0",
    "Type 'help' for available commands",
    "",
    "> help",
    "",
    "Use these commands to go to a different page:",
    "",
    "Available commands:",
    "  hud      - Navigate to Hero HUD",
    "  about    - Navigate to About page",
    "  lab      - Navigate to Project Lab",
    "  vault    - Navigate to Achievement Vault",
    "  contact  - Navigate to Contact page",
    "  admin    - Navigate to Admin Nexus",
    "  clear    - Clear terminal",
    "  exit     - Close terminal",
    "",
  ]);

  const commands: Record<string, () => void> = {
    help: () => {
      setHistory((prev) => [
        ...prev,
        "> help",
        "",
        "Use these commands to go to a different page:",
        "",
        "Available commands:",
        "  hud      - Navigate to Hero HUD",
        "  about    - Navigate to About page",
        "  lab      - Navigate to Project Lab",
        "  vault    - Navigate to Achievement Vault",
        "  contact  - Navigate to Contact page",
        "  admin    - Navigate to Admin Nexus",
        "  clear    - Clear terminal",
        "  exit     - Close terminal",
        "",
      ]);
    },
    hud: () => {
      setHistory((prev) => [...prev, "> hud", "Navigating to Hero HUD...", ""]);
      setTimeout(() => {
        navigate("/");
        onClose();
      }, 500);
    },
    about: () => {
      setHistory((prev) => [...prev, "> about", "Navigating to About page...", ""]);
      setTimeout(() => {
        navigate("/about");
        onClose();
      }, 500);
    },
    lab: () => {
      setHistory((prev) => [...prev, "> lab", "Navigating to Project Lab...", ""]);
      setTimeout(() => {
        navigate("/lab");
        onClose();
      }, 500);
    },
    vault: () => {
      setHistory((prev) => [...prev, "> vault", "Navigating to Achievement Vault...", ""]);
      setTimeout(() => {
        navigate("/vault");
        onClose();
      }, 500);
    },
    contact: () => {
      setHistory((prev) => [...prev, "> contact", "Navigating to Contact page...", ""]);
      setTimeout(() => {
        navigate("/contact");
        onClose();
      }, 500);
    },
    admin: () => {
      setHistory((prev) => [...prev, "> admin", "Navigating to Admin Nexus...", ""]);
      setTimeout(() => {
        navigate("/admin");
        onClose();
      }, 500);
    },
    clear: () => {
      setHistory([]);
    },
    exit: () => {
      setHistory((prev) => [...prev, "> exit", "Terminal closed.", ""]);
      setTimeout(onClose, 300);
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();

    if (cmd === "") return;

    if (commands[cmd]) {
      commands[cmd]();
    } else {
      setHistory((prev) => [
        ...prev,
        `> ${input}`,
        `Command not found: ${input}`,
        "Type 'help' for available commands",
        "",
      ]);
    }

    setInput("");
  };

  useEffect(() => {
    if (isOpen) {
      setInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl h-[600px] backdrop-blur-xl bg-[rgba(18,18,18,0.95)] border border-[#00FFC2] rounded-xl shadow-[0_0_40px_rgba(0,255,194,0.3)] flex flex-col overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,255,194,0.3)] bg-[rgba(0,255,194,0.05)]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <span className="font-mono text-sm text-[#00FFC2] ml-2">terminal@dev.nexus</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#00FFC2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-[#00FF00]">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-[rgba(0,255,194,0.3)] bg-[rgba(0,255,194,0.05)]">
          <ChevronRight className="w-4 h-4 text-[#00FFC2]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-[#00FF00] font-mono text-sm outline-none placeholder-gray-600"
            placeholder="Type a command..."
          />
        </form>
      </div>
    </div>
  );
}