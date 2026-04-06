import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { apiUrl } from "@/lib/api";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi — ask about this portfolio. I answer from server/data/site-content.json (profile, contact, story, experience, education, skills) and from MongoDB (projects and achievements). No external APIs.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [messages, open, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      setMessages([...next, { role: "assistant", content: data.reply || "(No reply)" }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `Sorry — ${msg}. Make sure the API server is running.`,
        },
      ]);
    } finally {
      setLoading(false);
      // Radix Dialog focus trap + disabled inputs often leave the composer unfocusable until the sheet remounts.
      queueMicrotask(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full border-0 bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] p-0 text-[#121212] shadow-[0_0_24px_rgba(0,255,194,0.35)] hover:opacity-90 md:bottom-8 md:right-8"
        aria-label="Open site assistant chat"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            queueMicrotask(() => inputRef.current?.focus({ preventScroll: true }));
          }}
          className="flex h-full max-h-[100dvh] w-full max-w-[min(100vw-0.5rem,26rem)] flex-col gap-0 overflow-hidden border-[rgba(0,255,194,0.2)] bg-[#0c0c0f] p-0 text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] sm:max-w-md"
        >
          <SheetHeader className="shrink-0 space-y-1 border-b border-[rgba(0,255,194,0.15)] bg-[#12121a]/95 px-5 py-4 text-left backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(0,255,194,0.35)] bg-[rgba(0,255,194,0.1)] text-[#00FFC2]">
                <Bot className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold tracking-tight text-[#00FFC2]">
                  Site assistant
                </SheetTitle>
                <SheetDescription className="text-xs leading-snug text-gray-400 sm:text-sm">
                  Answers from your site JSON and MongoDB (projects & achievements). No external APIs.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Native scroll: Radix ScrollArea often collapses to 0 height inside flex column sheets. */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
            >
              <ul className="flex flex-col gap-5 pr-1" aria-live="polite">
                {messages.map((m, i) => {
                  const isUser = m.role === "user";
                  return (
                    <li
                      key={i}
                      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "flex max-w-[min(100%,19rem)] items-end gap-2.5 sm:max-w-[min(100%,21rem)]",
                          isUser ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-md",
                            isUser
                              ? "border-[#00FFC2]/50 bg-gradient-to-br from-[#00FFC2] to-[#00b4d8] text-[#0a1628]"
                              : "border-[rgba(0,255,194,0.25)] bg-[#1a1a22] text-[#00FFC2]"
                          )}
                          aria-hidden
                        >
                          {isUser ? <User className="h-4 w-4" strokeWidth={2.25} /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div
                          className={cn(
                            "min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg",
                            isUser
                              ? "rounded-br-md border border-[#00FFC2]/45 bg-gradient-to-b from-[rgba(0,255,194,0.2)] to-[rgba(0,180,200,0.12)] text-white"
                              : "rounded-bl-md border border-white/[0.08] bg-[#18181f] text-gray-100"
                          )}
                        >
                          <span className="sr-only">{isUser ? "You: " : "Assistant: "}</span>
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {loading && (
                  <li className="flex w-full justify-start">
                    <div className="flex max-w-[min(100%,19rem)] items-end gap-2.5 sm:max-w-[min(100%,21rem)]">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(0,255,194,0.25)] bg-[#1a1a22] text-[#00FFC2]"
                        aria-hidden
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/[0.08] bg-[#18181f] px-4 py-3 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#00FFC2]" aria-hidden />
                        Thinking…
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {error && (
            <p className="mx-4 mb-1 text-xs text-red-400/95" role="alert">
              {error}
            </p>
          )}

          <form
            className="relative z-10 shrink-0 border-t border-[rgba(0,255,194,0.12)] bg-[#12121a]/90 px-4 py-4 backdrop-blur-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label htmlFor="assistant-input" className="sr-only">
              Your message
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                id="assistant-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about the site…"
                readOnly={loading}
                aria-busy={loading}
                autoComplete="off"
                className={cn(
                  "min-h-11 flex-1 rounded-xl border border-[rgba(0,255,194,0.28)] bg-[#0e0e12] px-4 text-sm text-white shadow-inner placeholder:text-gray-500 focus:border-[#00FFC2] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,194,0.2)]",
                  loading && "cursor-wait opacity-80",
                )}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 w-11 shrink-0 rounded-xl border-0 bg-gradient-to-r from-[#00FFC2] to-[#00c8e8] p-0 text-[#0a1628] shadow-[0_0_16px_rgba(0,255,194,0.25)] hover:opacity-95 disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
