import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MentionRow = {
  id: string;
  subject: string | null;
  title: string | null;
  url: string | null;
  source_name: string;
  published_at: string | null;
  sentiment: string | null;
  topic: string | null;
  reach: number | null;
  relevance: number | null;
};

/** Real stored mentions (organisation + competitors) from the last `days` days. */
export function useRecentMentions(days: number) {
  return useQuery({
    queryKey: ["intelligence", "recent-mentions", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const { data, error } = await supabase
        .from("intelligence_mentions")
        .select("id, subject, title, url, source_name, published_at, sentiment, topic, reach, relevance")
        .gte("published_at", since)
        .order("published_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as MentionRow[];
    },
  });
}

export function sentimentCounts(rows: MentionRow[]) {
  const c = { positive: 0, neutral: 0, negative: 0 };
  for (const r of rows) if (r.sentiment && r.sentiment in c) c[r.sentiment as keyof typeof c]++;
  return { ...c, labelled: c.positive + c.neutral + c.negative };
}

/** A simple three-part bar. Shows nothing invented: unlabelled mentions are excluded. */
export function SentimentBar({ rows }: { rows: MentionRow[] }) {
  const s = sentimentCounts(rows);
  if (!s.labelled) return <p className="text-xs text-muted-foreground">Not rated yet</p>;
  const pct = (n: number) => Math.round((n / s.labelled) * 100);
  return (
    <div className="min-w-[10rem]">
      <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
        <div className="bg-emerald-600" style={{ width: `${pct(s.positive)}%` }} />
        <div className="bg-muted-foreground/40" style={{ width: `${pct(s.neutral)}%` }} />
        <div className="bg-destructive" style={{ width: `${pct(s.negative)}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {pct(s.positive)}% positive · {pct(s.neutral)}% neutral · {pct(s.negative)}% negative
      </p>
    </div>
  );
}
