import { useState } from "react";
import {
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  Grid3x3,
  Map,
  PanelLeft,
  PieChart,
  Settings,
  Star,
  History,
  SquareTerminal,
} from "lucide-react";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl gap-6 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
        {sidebarOpen && (
          <aside className="w-72 shrink-0 rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-300">
                Platform
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-zinc-100">
                  <div className="flex items-center gap-2">
                    <SquareTerminal className="h-4 w-4 text-zinc-400" />
                    <span>Playground</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="space-y-2 border-l border-white/10 pl-5 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-zinc-500" />
                    <span>History</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-zinc-500" />
                    <span>Starred</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-zinc-500" />
                    <span>Settings</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-200">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-zinc-400" />
                    <span>Models</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-zinc-400" />
                    <span>Documentation</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-200">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-zinc-400" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <p className="text-sm font-semibold text-zinc-300">
                Projects
              </p>
              <div className="space-y-3 text-sm text-zinc-200">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4 text-zinc-400" />
                  <span>Design Engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-zinc-400" />
                  <span>Sales &amp; Marketing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-zinc-400" />
                  <span>Travel</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="flex flex-1 flex-col gap-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] transition hover:bg-zinc-900"
              aria-label={
                sidebarOpen ? "Hide sidebar" : "Show sidebar"
              }
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          <section className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`card-${index}`}
                className="min-h-[150px] rounded-2xl border border-white/10 bg-zinc-900/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              />
            ))}
          </section>

          <section className="min-h-[420px] rounded-2xl border border-white/10 bg-zinc-900/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]" />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
