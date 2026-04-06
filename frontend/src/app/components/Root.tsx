import { Outlet, Link, useLocation } from "react-router";
import { Terminal, Layers, Award, Lock, Code2, User, Mail, Menu } from "lucide-react";
import { useState } from "react";
import { TerminalOverlay } from "./TerminalOverlay";
import { SiteAssistant } from "./SiteAssistant";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";

export function Root() {
  const location = useLocation();
  const [showTerminal, setShowTerminal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/", label: "HUD", icon: Code2 },
    { path: "/about", label: "ABOUT", icon: User },
    { path: "/lab", label: "LAB", icon: Layers },
    { path: "/vault", label: "VAULT", icon: Award },
    { path: "/contact", label: "CONTACT", icon: Mail },
    { path: "/admin", label: "ADMIN", icon: Lock },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#121212]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-[#00FFC2] px-4 py-2 text-sm font-medium text-[#121212] shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#00E0FF]"
      >
        Skip to main content
      </a>

      <div className="fixed inset-0 bg-gradient-to-br from-[#121212] via-[#1a1a2e] to-[#0f3460] opacity-50" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <nav className="fixed left-0 right-0 top-0 z-50" aria-label="Primary">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-[rgba(0,255,194,0.3)] bg-[rgba(30,30,30,0.6)] px-3 py-2 shadow-[0_0_20px_rgba(0,255,194,0.1)] backdrop-blur-xl sm:px-6 sm:py-3">
            <Link to="/" className="group flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00FFC2] to-[#00E0FF] shadow-[0_0_20px_rgba(0,255,194,0.4)] transition-all group-hover:shadow-[0_0_30px_rgba(0,255,194,0.6)] sm:h-10 sm:w-10">
                <Code2 className="h-5 w-5 text-[#121212] sm:h-6 sm:w-6" />
              </div>
              <span className="truncate bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] bg-clip-text text-lg font-bold tracking-wider text-transparent sm:text-xl">
                DEV.NEXUS
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex xl:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all xl:px-4 ${
                      isActive
                        ? "bg-[rgba(0,255,194,0.2)] text-[#00FFC2] shadow-[0_0_15px_rgba(0,255,194,0.3)]"
                        : "text-gray-400 hover:bg-[rgba(0,255,194,0.1)] hover:text-[#00FFC2]"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="font-mono text-xs tracking-wider xl:text-sm">{item.label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => setShowTerminal(true)}
                className="ml-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-4 py-2 font-mono text-xs tracking-wider text-[#121212] transition-all hover:shadow-[0_0_20px_rgba(0,255,194,0.5)] xl:text-sm"
              >
                <Terminal className="h-4 w-4" aria-hidden />
                <span className="hidden xl:inline">TERMINAL</span>
                <span className="xl:hidden">TERM</span>
              </button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setShowTerminal(true)}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#00FFC2] to-[#00E0FF] px-3 py-2 font-mono text-xs text-[#121212]"
                aria-label="Open terminal overlay"
              >
                <Terminal className="h-4 w-4" />
              </button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="border-[rgba(0,255,194,0.35)] bg-[rgba(20,20,24,0.8)] text-[#00FFC2]"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[min(100vw-2rem,20rem)] border-[rgba(0,255,194,0.25)] bg-[#141418] text-white"
                >
                  <SheetHeader>
                    <SheetTitle className="text-left text-[#00FFC2]">Navigate</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-sm ${
                            isActive
                              ? "bg-[rgba(0,255,194,0.15)] text-[#00FFC2]"
                              : "text-gray-300 hover:bg-[rgba(255,255,255,0.06)]"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="relative z-10 pt-20 sm:pt-24" tabIndex={-1}>
        <Outlet />
      </main>

      <TerminalOverlay isOpen={showTerminal} onClose={() => setShowTerminal(false)} />
      <SiteAssistant />
    </div>
  );
}
