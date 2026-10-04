import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PRIORITIES, useMyWorkspace } from "@/lib/workspace";
import { RefreshCoverage } from "@/components/intelligence/RefreshCoverage";

export const Route = createFileRoute("/_authenticated/intelligence/overview")({
  head: () => ({ meta: [{ title: "Overview — SYAN Intelligence" }, { name: "robots", content: "noindex" }] }),
  component: IntelligenceOverview,
});

/** Figures come only from stored real mentions (last 30 days); nothing is estimated. */
function useMentionStats() {
  return useQuery({
    queryKey: ["intelligence", "overview-stats"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data, error } = await supabase
        .from("intelligence_mentions")
        .select("id, title, url, source_name, published_at, sentiment, topic, reach, relevance")
        .gte("published_at", since)
        .is("subject", null)
        .order("published_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useOpenAlerts() {
  return useQuery({
    queryKey: ["intelligence", "open-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_alerts")
        .select("id, title, severity, what_happened, recommended_action, detected_at")
        .neq("status", "resolved")
        .order("detected_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data ?? [];
    },
  });
}

function Metric({ label, help, value }: { label: string; help: string; value?: string | undefined }) {
  return (
    <div className="soft-card p-6">
      <p className="text-sm font-semibold">{label}</p>
      <p className={`num display-lg mt-3 text-3xl ${value ? "text-navy" : "text-muted-foreground"}`}>{value ?? "—"}</p>
      <p className="mt-2 text-xs text-muted-foreground">{help}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="soft-card p-6">
      <h2 className="font-serif text-lg font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-hairline p-5 text-sm text-muted-foreground">{text}</p>;
}

function IntelligenceOverview() {
  const { data: ws } = useMyWorkspace();
  const { data: mentions = [], isLoading } = useMentionStats();
  const { data: alerts = [] } = useOpenAlerts();
  const connected = mentions.length > 0;
  const waiting = "Appears once news coverage has been collected.";
  const pos = mentions.filter((m) => m.sentiment === "positive").length;
  const neg = mentions.filter((m) => m.sentiment === "negative").length;
  const rated = mentions.filter((m) => m.sentiment).length;
  const reachKnown = mentions.filter((m) => m.reach != null);
  const reachTotal = reachKnown.reduce((t, m) => t + (m.reach ?? 0), 0);
  const sentimentLabel = rated ? `${Math.round((pos / rated) * 100)}% positive` : undefined;
  const negShare = rated ? neg / rated : 0;
  const risk = !rated ? undefined : negShare >= 0.35 ? "High" : negShare >= 0.15 ? "Medium" : "Low";
  const topics = Object.entries(
    mentions.reduce<Record<string, number>>((acc, m) => { if (m.topic) acc[m.topic] = (acc[m.topic] ?? 0) + 1; return acc; }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const important = [...mentions].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0)).slice(0, 5);
  const weeks = [3, 2, 1, 0].map((w) => {
    const end = Date.now() - w * 6048e5, start = end - 6048e5;
    const inWeek = mentions.filter((m) => { const t = m.published_at ? Date.parse(m.published_at) : 0; return t > start && t <= end; });
    return { label: w === 0 ? "This week" : `${w} wk ago`, total: inWeek.length, neg: inWeek.filter((m) => m.sentiment === "negative").length };
  });
  const maxWeek = Math.max(1, ...weeks.map((w) => w.total));

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="display-lg mt-2 text-3xl">{ws?.organisation_name ?? "Your organisation"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          What people are saying about you, what it means, and what needs your attention.
        </p>
      </div>

      {!isLoading && !connected && (
        <div className="soft-card flex flex-wrap items-center justify-between gap-6 border-l-4 border-l-navy p-8">
          <div className="max-w-xl">
            <h2 className="font-serif text-xl font-bold">No monitoring data yet.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              News monitoring is connected. Check the news to collect real coverage of your names and keywords — this page fills in from what is found. Social media and broadcast sources are not connected yet.
            </p>
          </div>
          <RefreshCoverage label="Check the news now" />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total mentions" value={connected ? String(mentions.length) : undefined} help="News articles mentioning you in the last 30 days." />
        <Metric label="Sentiment" value={sentimentLabel} help={rated ? `${neg} negative of ${rated} rated articles.` : "Whether coverage is mostly positive, neutral or negative."} />
        <Metric label="Media reach" value={reachKnown.length ? new Intl.NumberFormat("en", { notation: "compact" }).format(reachTotal) : undefined} help={connected && !reachKnown.length ? "News sites do not publish audience figures, so reach is left blank rather than guessed." : "How many people the coverage could have reached."} />
        <Metric label="Reputation risk" value={risk} help="Based on the share of negative coverage in the last 30 days." />
      </div>

      <Panel title="Trend over time">
        {connected ? (
          <div className="grid grid-cols-4 items-end gap-4">
            {weeks.map((w) => (
              <div key={w.label} className="text-center">
                <div className="mx-auto flex h-32 w-full max-w-16 flex-col justify-end overflow-hidden rounded-lg bg-secondary">
                  <div className="bg-navy" style={{ height: `${(w.total / maxWeek) * 100}%` }} title={`${w.total} mentions, ${w.neg} negative`} />
                </div>
                <p className="num mt-2 text-sm font-semibold">{w.total}</p>
                <p className="text-xs text-muted-foreground">{w.label}</p>
              </div>
            ))}
          </div>
        ) : <Empty text={`Mentions per week over the last month. ${waiting}`} />}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Needs your attention">
          {alerts.length ? (
            <ul className="space-y-4">
              {alerts.map((a) => (
                <li key={a.id} className="border-b border-hairline pb-4 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{a.title}</p>
                    <span className="pill text-xs capitalize">{a.severity}</span>
                  </div>
                  {a.what_happened && <p className="mt-1 text-sm text-muted-foreground">{a.what_happened}</p>}
                  {a.recommended_action && <p className="mt-1 text-sm"><span className="font-semibold">Suggested next step:</span> {a.recommended_action}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nothing needs your attention right now. Stories that could affect your reputation will be flagged here with a suggested next step." />
          )}
        </Panel>
        <Panel title="Recent important mentions">
          {important.length ? (
            <ul className="space-y-3">
              {important.map((m) => (
                <li key={m.id} className="text-sm">
                  <a href={m.url ?? undefined} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{m.title ?? "Untitled"}</a>
                  <p className="text-xs text-muted-foreground">{m.source_name}{m.sentiment ? ` · ${m.sentiment}` : ""}</p>
                </li>
              ))}
            </ul>
          ) : <Empty text={`The most significant articles about you. ${waiting}`} />}
        </Panel>
        <Panel title="Top topics">
          {topics.length ? (
            <div className="flex flex-wrap gap-2">{topics.map(([t, n]) => <span key={t} className="pill">{t} · {n}</span>)}</div>
          ) : <Empty text={`The themes people connect with your organisation. ${waiting}`} />}
        </Panel>
        <Panel title="What we're tracking">
          {ws ? (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">{ws.keywords.map((k) => <span key={k} className="pill">{k}</span>)}</div>
              <p className="text-muted-foreground">
                {ws.competitors.length ? `Compared against ${ws.competitors.join(", ")}.` : "No competitors added yet."}{" "}
                Focus: {PRIORITIES.filter((p) => ws.priorities.includes(p.id)).map((p) => p.label).join(", ") || "not set"}.
              </p>
              <Link to="/intelligence/settings" className="font-semibold underline underline-offset-4">Review settings</Link>
            </div>
          ) : (
            <Empty text="Tell us which names and keywords to listen for in Settings." />
          )}
        </Panel>
      </div>
    </div>
  );
}
