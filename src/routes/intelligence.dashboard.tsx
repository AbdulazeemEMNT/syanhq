import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, ChevronDown, Plug, Send, UserRound } from "lucide-react";
import {
  kpis,
  riskLevels,
  assistantPrompts,
  reportTypes,
  adminSections,
} from "@/content/intelligence";

export const Route = createFileRoute("/intelligence/dashboard")({
  head: () => ({
    meta: [
      { title: "Intelligence Dashboard — SYAN Intelligence™" },
      {
        name: "description",
        content:
          "The SYAN Intelligence dashboard: brand health, reach, share of voice, sentiment, narrative, reputation risk, competitors and AI visibility.",
      },
      { property: "og:title", content: "SYAN Intelligence Dashboard" },
      {
        property: "og:description",
        content: "Brand health, narrative, risk and AI visibility in one intelligence surface.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const noSource = "No data provider connected for this project.";

function Dashboard() {
  const [range, setRange] = useState("Last 7 days");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = (q: string) => {
    setQuestion(q);
    setAnswer(
      `Insufficient data. This project has no connected data provider, so SYAN Intelligence cannot answer “${q}” without fabricating analytics. Connect a licensed source under Admin → Intelligence → Integrations to enable this answer.`,
    );
  };

  return (
    <div className="surface-obsidian min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-6 px-5 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/intelligence" className="font-serif font-bold text-lg">
              SYAN <span className="text-[color:var(--gold)]">Intelligence</span>
            </Link>
            <button className="hidden items-center gap-2 border border-white/12 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/70 sm:flex">
              Project: Unassigned <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 border border-white/12 p-1 md:flex">
              {["Last 7 days", "Last 30 days", "Quarter"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] ${
                    range === r
                      ? "bg-[color:var(--gold)] text-[color:var(--navy)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <span className="border border-white/12 p-2 text-white/60">
              <Bell className="h-4 w-4" />
            </span>
            <span className="border border-white/12 p-2 text-white/60">
              <UserRound className="h-4 w-4" />
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[100rem] space-y-px px-5 py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-white/12 bg-white/[0.03] px-6 py-4">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Plug className="h-4 w-4 text-[color:var(--gold)]" />
            Integration status: <span className="text-white">no provider connected</span> — figures
            below stay empty until a licensed source is attached.
          </div>
          <Link
            to="/contact"
            className="border border-[color:var(--gold)] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--navy)]"
          >
            Request connection
          </Link>
        </div>

        {/* KPI row */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.key} className="bg-[color:var(--card)] p-6">
              <p className="eyebrow text-white/40">{k.label}</p>
              <p className="num mt-4 text-3xl text-white/35">—</p>
              <p className="mt-2 text-[11px] text-white/35">Awaiting data · {k.unit}</p>
            </div>
          ))}
        </div>

        {/* Main panels */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <Panel title="What changed?" subtitle="AI summary of the most important developments" className="lg:col-span-2">
            <Empty text="No developments to summarise. SYAN Intelligence does not generate summaries without source data." />
          </Panel>
          <Panel title="Reputation risks" subtitle="Ranked by severity">
            <ul className="space-y-px bg-white/10">
              {riskLevels.map((level) => (
                <li
                  key={level}
                  className="flex items-center justify-between bg-[color:var(--card)] px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="h-2 w-2"
                      style={{
                        backgroundColor:
                          level === "Critical"
                            ? "var(--critical)"
                            : level === "High"
                              ? "var(--caution)"
                              : level === "Medium"
                                ? "var(--gold)"
                                : "var(--platinum)",
                      }}
                    />
                    {level}
                  </span>
                  <span className="num text-white/35">0</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/40">{noSource}</p>
          </Panel>

          <Panel title="Trends" subtitle="Mentions · Reach · Sentiment · Share of Voice" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Mentions", "Reach", "Sentiment", "Share of Voice"].map((t) => (
                <div key={t} className="bg-[color:var(--card)] p-5">
                  <p className="eyebrow text-white/40">{t}</p>
                  <div className="mt-4 flex h-24 items-end gap-1 opacity-30">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span key={i} className="flex-1 border-b border-dashed border-white/40" />
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-white/35">Series unavailable</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="What's the world talking about?" subtitle="Emerging topic clusters">
            <Empty text="No topic clusters yet. Topics appear once mentions are ingested and clustered." />
          </Panel>

          <Panel title="Competitors" subtitle="Share of voice comparison" className="lg:col-span-2">
            <div className="space-y-px bg-white/10">
              {["Client brand", "Competitor A", "Competitor B", "Competitor C"].map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between bg-[color:var(--card)] px-4 py-3 text-sm"
                >
                  <span className="text-white/70">{c}</span>
                  <span className="flex items-center gap-4">
                    <span className="h-1 w-40 bg-white/10" />
                    <span className="num text-white/35">—</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/40">
              Define the competitive set under Admin → Intelligence → Competitors.
            </p>
          </Panel>

          <Panel title="AI Visibility" subtitle="Score · Share of voice · Prompts · Sources">
            <div className="space-y-3 text-sm">
              {[
                "AI Visibility Score",
                "AI Share of Voice",
                "Top prompts",
                "Competitor comparison",
                "Top cited sources",
              ].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between border-b border-white/10 pb-2 text-white/60"
                >
                  <span>{row}</span>
                  <span className="num text-white/35">—</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/40">{noSource}</p>
          </Panel>
        </div>

        {/* Assistant */}
        <div className="mt-8 border border-white/12 bg-[color:var(--card)] p-7">
          <p className="eyebrow text-[color:var(--gold)]">SYAN Intelligence Assistant</p>
          <p className="mt-3 font-serif font-bold text-2xl">Ask about this project.</p>
          <form
            className="mt-6 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) ask(question.trim());
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why did our brand mentions spike this week?"
              className="w-full border border-white/12 bg-transparent px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[color:var(--gold)] px-5 text-xs uppercase tracking-[0.16em] text-[color:var(--navy)]"
            >
              Ask <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            {assistantPrompts.map((p) => (
              <button
                key={p}
                onClick={() => ask(p)}
                className="border border-white/12 px-3 py-2 text-[11px] text-white/60 hover:border-[color:var(--gold)] hover:text-white"
              >
                {p}
              </button>
            ))}
          </div>
          {answer && (
            <p className="mt-6 border-l-2 border-[color:var(--gold)] bg-white/[0.03] p-5 text-sm leading-relaxed text-white/75">
              {answer}
            </p>
          )}
        </div>

        {/* Reports + admin map */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Panel title="Reports" subtitle="Generate and export">
            <div className="grid gap-4 sm:grid-cols-2">
              {reportTypes.map((r) => (
                <div key={r} className="flex items-center justify-between bg-[color:var(--card)] p-4">
                  <span className="text-sm text-white/70">{r}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                    Needs data
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Admin → Intelligence" subtitle="Configuration surfaces">
            <div className="grid gap-4 sm:grid-cols-2">
              {adminSections.map((s) => (
                <div key={s.name} className="bg-[color:var(--card)] p-4">
                  <p className="text-sm text-white/80">{s.name}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/40">{s.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/40">
              Administration is enabled once accounts and the backend are switched on for your
              workspace.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-white/12 bg-[color:var(--card)] p-7 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif font-bold text-xl">{title}</h2>
        {subtitle && <p className="eyebrow text-white/35">{subtitle}</p>}
      </div>
      <div className="rule-gold my-5 opacity-40" />
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-white/15 p-8 text-center">
      <p className="text-sm leading-relaxed text-white/45">{text}</p>
    </div>
  );
}
