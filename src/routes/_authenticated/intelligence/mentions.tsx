import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { RefreshCoverage } from "@/components/intelligence/RefreshCoverage";

export const Route = createFileRoute("/_authenticated/intelligence/mentions")({
  head: () => ({ meta: [{ title: "Mentions — SYAN Intelligence" }, { name: "robots", content: "noindex" }] }),
  component: Mentions,
});

type Sort = "recent" | "reach" | "relevant";
const PERIODS = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "all", label: "All time" },
] as const;

const SENTIMENT_STYLE: Record<string, string> = {
  positive: "border-navy/40 text-navy",
  neutral: "border-hairline text-muted-foreground",
  negative: "border-destructive/50 text-destructive",
};

function formatReach(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function safeUrl(u: string | null) {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function Mentions() {
  const [period, setPeriod] = useState("30");
  const [sentiment, setSentiment] = useState("all");
  const [topic, setTopic] = useState("all");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [search, setSearch] = useState("");

  const { data: mentions = [], isLoading, isError } = useQuery({
    queryKey: ["intelligence", "mentions", period, sentiment, topic, source, sort],
    queryFn: async () => {
      let q = supabase
        .from("intelligence_mentions")
        .select("id, source_name, published_at, title, excerpt, author, sentiment, topic, reach, url, relevance")
        .is("subject", null);
      if (period !== "all") q = q.gte("published_at", new Date(Date.now() - Number(period) * 864e5).toISOString());
      if (sentiment !== "all") q = q.eq("sentiment", sentiment);
      if (topic !== "all") q = q.eq("topic", topic);
      if (source !== "all") q = q.eq("source_name", source);
      if (sort === "reach") q = q.order("reach", { ascending: false, nullsFirst: false });
      else if (sort === "relevant") q = q.order("relevance", { ascending: false, nullsFirst: false });
      q = q.order("published_at", { ascending: false, nullsFirst: false });
      const { data, error } = await q.limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Filter choices come only from real mentions already received.
  const { data: options } = useQuery({
    queryKey: ["intelligence", "mention-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("intelligence_mentions").select("topic, source_name").is("subject", null).limit(1000);
      if (error) throw error;
      const rows = data ?? [];
      return {
        total: rows.length,
        topics: [...new Set(rows.map((r) => r.topic).filter(Boolean) as string[])].sort(),
        sources: [...new Set(rows.map((r) => r.source_name))].sort(),
      };
    },
  });

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return mentions;
    return mentions.filter((m) =>
      [m.title, m.excerpt, m.author, m.source_name].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [mentions, search]);

  const noData = options && options.total === 0;
  const selectCls = "h-10 rounded-full border border-hairline bg-card px-4 text-sm";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Mentions</p>
        <h1 className="display-lg mt-2 text-3xl">What's being said about you</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          News coverage of your names and keywords. Social media and broadcast are not connected yet.
        </p>
      </div>
      {!noData && <RefreshCoverage />}
      </div>

      {noData ? (
        <div className="soft-card p-10 text-center">
          <h2 className="font-serif text-xl font-bold">No mentions yet.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            News monitoring is connected. Check the news now to collect real coverage of your names and keywords from the last 7 days.
          </p>
          <div className="mt-6 flex justify-center"><RefreshCoverage label="Check the news now" /></div>
        </div>
      ) : (
        <>
          <div className="soft-card flex flex-wrap items-center gap-3 p-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search headlines, authors…" className="h-10 max-w-xs rounded-full" />
            <select aria-label="Date" className={selectCls} value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select aria-label="Sentiment" className={selectCls} value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
              <option value="all">All sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <select aria-label="Topic" className={selectCls} value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="all">All topics</option>
              {options?.topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select aria-label="Source" className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="all">All sources</option>
              {options?.sources.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select aria-label="Sort by" className={`${selectCls} ml-auto`} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="recent">Most recent</option>
              <option value="reach">Highest reach</option>
              <option value="relevant">Most relevant</option>
            </select>
          </div>

          {isLoading || !options ? (
            <p className="text-sm text-muted-foreground">Loading mentions…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">We couldn't load mentions just now. Please refresh the page.</p>
          ) : visible.length === 0 ? (
            <div className="soft-card p-8 text-center text-sm text-muted-foreground">
              No mentions match these filters. Try a longer date range or clear a filter.
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map((m) => {
                const href = safeUrl(m.url);
                return (
                  <li key={m.id} className="soft-card p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.source_name}</span>
                      {m.published_at && <span>{new Date(m.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
                      {m.author && <span>by {m.author}</span>}
                    </div>
                    <h2 className="mt-2 font-serif text-lg font-bold">{m.title ?? "Untitled mention"}</h2>
                    {m.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{m.excerpt}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      {m.sentiment && <span className={`pill capitalize ${SENTIMENT_STYLE[m.sentiment] ?? ""}`}>{m.sentiment}</span>}
                      {m.topic && <span className="pill">{m.topic}</span>}
                      {m.reach != null && <span className="pill">Reach {formatReach(m.reach)}</span>}
                      {href && (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="ml-auto font-semibold underline underline-offset-4">
                          Read original
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {visible.length === 200 && <p className="text-xs text-muted-foreground">Showing the first 200 results. Narrow the filters to see more.</p>}
        </>
      )}
    </div>
  );
}
