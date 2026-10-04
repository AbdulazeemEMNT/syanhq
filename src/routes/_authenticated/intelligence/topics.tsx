import { createFileRoute } from "@tanstack/react-router";
import { RefreshCoverage } from "@/components/intelligence/RefreshCoverage";
import { SentimentBar, useRecentMentions, type MentionRow } from "@/components/intelligence/shared";

export const Route = createFileRoute("/_authenticated/intelligence/topics")({
  head: () => ({ meta: [{ title: "Topics — SYAN Intelligence" }, { name: "robots", content: "noindex" }] }),
  component: Topics,
});

const MIN_MENTIONS = 5;
const HALF = 14 * 864e5;

function trendOf(rows: MentionRow[], now: number) {
  let recent = 0;
  let before = 0;
  for (const r of rows) {
    if (!r.published_at) continue;
    const age = now - Date.parse(r.published_at);
    if (age < HALF) recent++;
    else if (age < HALF * 2) before++;
  }
  if (recent + before < 3) return { label: "Not enough data yet", tone: "text-muted-foreground" };
  if (recent > before * 1.25) return { label: `Rising (${before} → ${recent})`, tone: "text-emerald-700" };
  if (recent < before * 0.75) return { label: `Falling (${before} → ${recent})`, tone: "text-destructive" };
  return { label: `Steady (${before} → ${recent})`, tone: "text-foreground" };
}

function Topics() {
  const { data = [], isLoading } = useRecentMentions(28);
  const own = data.filter((m) => !m.subject);
  const groups = new Map<string, MentionRow[]>();
  for (const m of own) if (m.topic) (groups.get(m.topic) ?? groups.set(m.topic, []).get(m.topic)!).push(m);
  const topics = [...groups.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12);
  const max = topics[0]?.[1].length ?? 1;
  const now = Date.now();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg text-3xl">Topics</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The main themes in real coverage about your organisation over the last 4 weeks. Trend compares the last
            2 weeks with the 2 weeks before.
          </p>
        </div>
        <RefreshCoverage />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : own.length < MIN_MENTIONS || topics.length === 0 ? (
        <div className="soft-card p-8">
          <p className="font-serif text-lg font-bold">More data is needed</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {own.length === 0
              ? "No monitoring data yet. Check for new coverage to start detecting the topics people associate with you."
              : `Only ${own.length} mention${own.length === 1 ? "" : "s"} found so far. Topics become meaningful once at least ${MIN_MENTIONS} mentions have been collected — check again over the coming days.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map(([name, rows]) => {
            const trend = trendOf(rows, now);
            const examples = [...rows].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0)).slice(0, 3);
            return (
              <div key={name} className="soft-card p-6">
                <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
                  <div>
                    <h2 className="font-serif text-lg font-bold">{name}</h2>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-navy" style={{ width: `${(rows.length / max) * 100}%` }} />
                      </div>
                      <span className="num text-sm font-semibold">
                        {rows.length} mention{rows.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow">Sentiment</p>
                    <div className="mt-2"><SentimentBar rows={rows} /></div>
                  </div>
                  <div>
                    <p className="eyebrow">Trend</p>
                    <p className={`mt-2 text-sm font-semibold ${trend.tone}`}>{trend.label}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2 border-t border-hairline pt-4">
                  {examples.map((m) => (
                    <li key={m.id} className="text-sm">
                      {m.url ? (
                        <a href={m.url} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">
                          {m.title ?? m.url}
                        </a>
                      ) : (
                        <span className="font-medium">{m.title}</span>
                      )}
                      <span className="text-muted-foreground"> — {m.source_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
