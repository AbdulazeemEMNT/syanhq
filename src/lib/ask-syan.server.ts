import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Db = SupabaseClient<Database>;
type Row = {
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
  created_at: string;
};

const DAY = 864e5;
const when = (r: Row) => Date.parse(r.published_at ?? r.created_at);

function sentimentOf(rows: Row[]) {
  const c = { positive: 0, neutral: 0, negative: 0, unlabelled: 0 };
  for (const r of rows) {
    const s = (r.sentiment ?? "").toLowerCase();
    if (s === "positive" || s === "neutral" || s === "negative") c[s]++;
    else c.unlabelled++;
  }
  const labelled = c.positive + c.neutral + c.negative;
  const pct = (n: number) => (labelled ? Math.round((n / labelled) * 100) : null);
  return { counts: c, percent: { positive: pct(c.positive), neutral: pct(c.neutral), negative: pct(c.negative) } };
}

const brief = (r: Row) => ({
  title: r.title,
  source: r.source_name,
  date: r.published_at?.slice(0, 10) ?? null,
  sentiment: r.sentiment,
  topic: r.topic,
  url: r.url,
});

/** Builds the fixed set of read-only tools. All queries run as the signed-in user (RLS applies). */
export async function buildAskTools(db: Db) {
  const { data: ws } = await db
    .from("intelligence_workspaces")
    .select("id, organisation_name, website, keywords, competitors, priorities")
    .order("created_at").limit(1)
    .maybeSingle();

  let cache: Row[] | null = null;
  async function load(): Promise<Row[]> {
    if (!ws) return [];
    if (cache) return cache;
    const since = new Date(Date.now() - 90 * DAY).toISOString();
    const { data } = await db
      .from("intelligence_mentions")
      .select("id, subject, title, url, source_name, published_at, sentiment, topic, reach, relevance, created_at")
      .eq("workspace_id", ws.id)
      .gte("created_at", since)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3000);
    cache = (data ?? []) as Row[];
    return cache;
  }
  const own = async (days: number) => {
    const cut = Date.now() - days * DAY;
    return (await load()).filter((r) => !r.subject && when(r) >= cut);
  };
  const noWs = { error: "No Intelligence workspace is set up for this account, so there is no data to answer from." };
  const days = z.number().int().describe("Look-back window in days (1–90). Use 7 for 'this week', 30 for 'this month'.");
  const clampDays = (d: number) => Math.min(90, Math.max(1, d || 7));

  const tools = {
    getBrandSummary: tool({
      description: "Organisation profile and headline coverage figures: what is monitored and mention totals for the period vs the previous equal period.",
      inputSchema: z.object({ days }),
      execute: async ({ days: d }) => {
        if (!ws) return noWs;
        const n = clampDays(d);
        const all = (await load()).filter((r) => !r.subject);
        const now = Date.now();
        const cur = all.filter((r) => when(r) >= now - n * DAY);
        const prev = all.filter((r) => when(r) < now - n * DAY && when(r) >= now - 2 * n * DAY);
        return {
          organisation: ws.organisation_name,
          website: ws.website,
          keywords: ws.keywords,
          competitors: ws.competitors,
          priorities: ws.priorities,
          periodDays: n,
          mentionsThisPeriod: cur.length,
          mentionsPreviousPeriod: prev.length,
          sentimentThisPeriod: sentimentOf(cur),
          sentimentPreviousPeriod: sentimentOf(prev),
          note: "Only news coverage is monitored. Media reach is not available from news sources.",
        };
      },
    }),
    getRecentMentions: tool({
      description: "List real monitored mentions of the organisation, optionally filtered by sentiment or topic.",
      inputSchema: z.object({
        days,
        sentiment: z.enum(["any", "positive", "neutral", "negative"]),
        topic: z.string().nullable().describe("Exact topic label, or null for any"),
        sort: z.enum(["recent", "relevant"]),
        limit: z.number().int().describe("Max items, up to 15"),
      }),
      execute: async ({ days: d, sentiment, topic, sort, limit }) => {
        if (!ws) return noWs;
        let rows = await own(clampDays(d));
        if (sentiment !== "any") rows = rows.filter((r) => r.sentiment?.toLowerCase() === sentiment);
        if (topic) rows = rows.filter((r) => r.topic?.toLowerCase() === topic.toLowerCase());
        if (sort === "relevant") rows = [...rows].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
        return { total: rows.length, mentions: rows.slice(0, Math.min(15, Math.max(1, limit || 10))).map(brief) };
      },
    }),
    getSentiment: tool({
      description: "Sentiment breakdown for the period, week by week, plus the previous equal period for comparison.",
      inputSchema: z.object({ days }),
      execute: async ({ days: d }) => {
        if (!ws) return noWs;
        const n = clampDays(d);
        const all = (await load()).filter((r) => !r.subject);
        const now = Date.now();
        const cur = all.filter((r) => when(r) >= now - n * DAY);
        const prev = all.filter((r) => when(r) < now - n * DAY && when(r) >= now - 2 * n * DAY);
        const weeks = [];
        for (let w = 0; w * 7 < n; w++) {
          const rows = cur.filter((r) => when(r) < now - w * 7 * DAY && when(r) >= now - (w + 1) * 7 * DAY);
          weeks.push({ weeksAgo: w, mentions: rows.length, ...sentimentOf(rows) });
        }
        return { periodDays: n, current: sentimentOf(cur), previous: sentimentOf(prev), weekly: weeks };
      },
    }),
    getTopTopics: tool({
      description: "Topics in coverage ranked by volume, with sentiment per topic and change vs the previous equal period.",
      inputSchema: z.object({ days }),
      execute: async ({ days: d }) => {
        if (!ws) return noWs;
        const n = clampDays(d);
        const all = (await load()).filter((r) => !r.subject && r.topic);
        const now = Date.now();
        const map = new Map<string, { cur: Row[]; prev: number }>();
        for (const r of all) {
          const t = r.topic as string;
          const e = map.get(t) ?? { cur: [], prev: 0 };
          if (when(r) >= now - n * DAY) e.cur.push(r);
          else if (when(r) >= now - 2 * n * DAY) e.prev++;
          map.set(t, e);
        }
        const topics = [...map.entries()]
          .filter(([, e]) => e.cur.length)
          .sort((a, b) => b[1].cur.length - a[1].cur.length)
          .slice(0, 10)
          .map(([topic, e]) => ({
            topic,
            mentions: e.cur.length,
            previousPeriod: e.prev,
            sentiment: sentimentOf(e.cur).counts,
            examples: e.cur.slice(0, 2).map(brief),
          }));
        return { periodDays: n, topics };
      },
    }),
    getCompetitorComparison: tool({
      description: "Compare coverage volume, share of conversation and sentiment between the organisation and its configured competitors.",
      inputSchema: z.object({ days }),
      execute: async ({ days: d }) => {
        if (!ws) return noWs;
        const n = clampDays(d);
        const cut = Date.now() - n * DAY;
        const rows = (await load()).filter((r) => when(r) >= cut);
        const groups = [
          { name: ws.organisation_name, isYou: true, rows: rows.filter((r) => !r.subject) },
          ...(ws.competitors ?? []).map((c) => ({
            name: c,
            isYou: false,
            rows: rows.filter((r) => r.subject?.toLowerCase() === c.toLowerCase()),
          })),
        ];
        const total = groups.reduce((s, g) => s + g.rows.length, 0);
        return {
          periodDays: n,
          totalMentions: total,
          note: "Competitor coverage is only collected for the first three competitors. Media reach is not available from news sources.",
          organisations: groups.map((g) => ({
            name: g.name,
            isYou: g.isYou,
            mentions: g.rows.length,
            shareOfConversationPct: total >= 10 ? Math.round((g.rows.length / total) * 100) : null,
            sentiment: sentimentOf(g.rows).counts,
          })),
        };
      },
    }),
    getReputationAlerts: tool({
      description: "Reputation risk signals derived from real coverage: negative share, the most relevant negative mentions and topics where negative coverage is concentrated.",
      inputSchema: z.object({ days }),
      execute: async ({ days: d }) => {
        if (!ws) return noWs;
        const rows = await own(clampDays(d));
        const s = sentimentOf(rows);
        const negShare = (s.percent.negative ?? 0) / 100;
        const neg = rows.filter((r) => r.sentiment?.toLowerCase() === "negative");
        const byTopic = new Map<string, number>();
        for (const r of neg) if (r.topic) byTopic.set(r.topic, (byTopic.get(r.topic) ?? 0) + 1);
        return {
          mentions: rows.length,
          riskLevel: rows.length < 5 ? "insufficient data" : negShare >= 0.35 ? "high" : negShare >= 0.15 ? "medium" : "low",
          negativeSharePct: s.percent.negative,
          negativeTopics: [...byTopic.entries()].sort((a, b) => b[1] - a[1]).map(([topic, count]) => ({ topic, count })),
          topNegativeMentions: [...neg].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0)).slice(0, 5).map(brief),
        };
      },
    }),
    getMediaSources: tool({
      description: "Which media outlets covered the organisation in the period, ranked by number of mentions, with sentiment per outlet.",
      inputSchema: z.object({ days }),
      execute: async ({ days: d }) => {
        if (!ws) return noWs;
        const rows = await own(clampDays(d));
        const map = new Map<string, Row[]>();
        for (const r of rows) map.set(r.source_name, [...(map.get(r.source_name) ?? []), r]);
        return {
          sources: [...map.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 15)
            .map(([source, rs]) => ({ source, mentions: rs.length, sentiment: sentimentOf(rs).counts })),
        };
      },
    }),
  };
  return { tools, organisation: ws?.organisation_name ?? null };
}

export const ASK_SYSTEM = (org: string | null, today: string) => `You are Ask SYAN, the analyst inside SYAN Intelligence${org ? ` for ${org}` : ""}. Today is ${today}.

Rules:
- Answer ONLY from the data returned by your tools. For any question about coverage, sentiment, topics, competitors, risks, sources or changes, call the relevant tools first (call several when helpful, e.g. two periods to compare).
- Never invent or estimate statistics, mentions, sentiment, competitors, outlets or events. If a tool returns little or no data, say clearly that there is not enough data to answer and suggest pressing "Check for new coverage".
- Monitoring covers news only (no social media or broadcast). Media reach is not available.
- You cannot know WHY something happened beyond what the headlines show; explain causes only by pointing to specific mentions.
- Write for a busy communications executive: plain language, short paragraphs or bullets, no technical terms.
- End every data answer with an "**Evidence**" section listing the figures used and up to 5 supporting headlines as markdown links [Headline](url) — Source, date.
- Politely decline questions unrelated to the organisation's media intelligence.`;
