import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PRIORITIES, useMyWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/intelligence/overview")({
  head: () => ({ meta: [{ title: "Overview — SYAN Intelligence" }, { name: "robots", content: "noindex" }] }),
  component: IntelligenceOverview,
});

/** Only sources marked connected count; nothing on this page is estimated or simulated. */
function useConnectedSources() {
  return useQuery({
    queryKey: ["intelligence", "connected-sources"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("project_sources")
        .select("id", { count: "exact", head: true })
        .eq("is_connected", true);
      if (error) return 0;
      return count ?? 0;
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

function Metric({ label, help }: { label: string; help: string }) {
  return (
    <div className="soft-card p-6">
      <p className="text-sm font-semibold">{label}</p>
      <p className="num display-lg mt-3 text-3xl text-muted-foreground">—</p>
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
  const { data: sources = 0, isLoading } = useConnectedSources();
  const { data: alerts = [] } = useOpenAlerts();
  const connected = sources > 0;
  const waiting = connected
    ? "Gathering data from your connected sources — this appears once the first mentions arrive."
    : "Appears once a monitoring source is connected.";

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
              Connect a supported source to begin tracking conversations about your organisation — for
              example news websites, social media or broadcast monitoring. Once connected, this page fills in
              automatically.
            </p>
          </div>
          <Link to="/intelligence/settings" className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-navy-foreground">
            See how to connect a source
          </Link>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total mentions" help="How often you were talked about in the selected period." />
        <Metric label="Sentiment" help="Whether coverage is mostly positive, neutral or negative." />
        <Metric label="Media reach" help="How many people the coverage could have reached." />
        <Metric label="Reputation risk" help="Low, medium or high, based on negative or fast-growing stories." />
      </div>

      <Panel title="Trend over time">
        <Empty text={`Mentions and sentiment over the last 30 days. ${waiting}`} />
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
          <Empty text={`The most significant articles and posts about you. ${waiting}`} />
        </Panel>
        <Panel title="Top topics">
          <Empty text={`The themes people connect with your organisation. ${waiting}`} />
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
