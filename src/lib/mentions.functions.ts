import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type NewsHit = { title?: string; url?: string; snippet?: string; date?: string };

/** "4 days ago" / "2 hours ago" / "Sep 29, 2026" -> ISO date, or null when unknown. */
function parseDate(raw: string | undefined, now: number): string | null {
  if (!raw) return null;
  const m = raw.match(/(\d+)\s*(minute|min|hour|day|week|month)s?\s+ago/i);
  if (m) {
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    const ms = unit.startsWith("min") ? 6e4 : unit === "hour" ? 36e5 : unit === "day" ? 864e5 : unit === "week" ? 6048e5 : 2592e6;
    return new Date(now - n * ms).toISOString();
  }
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function classify(items: { i: number; title: string; snippet: string }[], org: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey || !items.length) return new Map<number, { sentiment?: string; topic?: string; relevance?: number }>();
  const { createOpenAI } = await import("@ai-sdk/openai");
  const { streamText } = await import("ai");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(url, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system:
      `You analyse news coverage for the organisation "${org}". For each item, judge ONLY from the given headline and snippet: sentiment towards ${org} (positive, neutral or negative), a short topic label (1-3 words, Title Case, e.g. "Financial Results", "Leadership", "Regulation"), and relevance 0-1 (how much the item is genuinely about ${org}). Return ONLY JSON {"items":[{"i":number,"sentiment":string,"topic":string,"relevance":number}]}.`,
    prompt: JSON.stringify(items),
    providerOptions: {
      openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
    },
  });
  const text = await result.text;
  const out = new Map<number, { sentiment?: string; topic?: string; relevance?: number }>();
  try {
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as { items?: { i: number; sentiment?: string; topic?: string; relevance?: number }[] };
    for (const r of parsed.items ?? []) out.set(Number(r.i), r);
  } catch {
    /* leave unclassified rather than guess */
  }
  return out;
}

/** Pulls real news coverage for the caller's keywords (last 7 days) and stores it. */
export const refreshMentions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: ws } = await context.supabase
      .from("intelligence_workspaces")
      .select("id, organisation_name, keywords")
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!ws) throw new Error("Finish setting up your workspace first.");

    const lovableKey = process.env["LOVABLE_API_KEY"];
    const fcKey = process.env["FIRECRAWL_API_KEY"];
    if (!lovableKey || !fcKey) throw new Error("News monitoring isn't connected yet.");

    const terms = (ws.keywords.length ? ws.keywords : [ws.organisation_name]).slice(0, 4);
    const hits = new Map<string, NewsHit>();
    for (const term of terms) {
      const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": fcKey },
        body: JSON.stringify({ query: `"${term.replace(/"/g, "")}"`, sources: [{ type: "news" }], tbs: "qdr:w", limit: 10 }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`News search failed [${res.status}]: ${body}`);
        if (res.status === 402 || res.status === 403) throw new Error("News monitoring is paused: the workspace has run out of credits or reached its limit.");
        continue;
      }
      const json = (await res.json()) as { data?: { news?: NewsHit[] } };
      for (const h of json.data?.news ?? []) if (h.url && !hits.has(h.url)) hits.set(h.url, h);
    }

    const list = [...hits.values()].slice(0, 40);
    const now = Date.now();
    const labels = await classify(
      list.map((h, i) => ({ i, title: h.title ?? "", snippet: (h.snippet ?? "").slice(0, 400) })),
      ws.organisation_name,
    ).catch(() => new Map());

    const rows = list.map((h, i) => {
      const l = labels.get(i) ?? {};
      const sentiment = ["positive", "neutral", "negative"].includes(String(l.sentiment)) ? String(l.sentiment) : null;
      const relevance = typeof l.relevance === "number" ? Math.min(1, Math.max(0, l.relevance)) : null;
      return {
        workspace_id: ws.id,
        external_id: h.url!,
        url: h.url!,
        source_name: hostOf(h.url!) ?? "News",
        title: h.title?.slice(0, 500) ?? null,
        excerpt: h.snippet?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 1000) ?? null,
        published_at: parseDate(h.date, now),
        sentiment,
        topic: l.topic ? String(l.topic).slice(0, 60) : null,
        relevance,
        reach: null,
      };
    });

    if (rows.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("intelligence_mentions")
        .upsert(rows, { onConflict: "workspace_id,external_id", ignoreDuplicates: true });
      if (error) throw new Error("We found coverage but couldn't save it. Please try again.");
    }
    return { found: rows.length };
  });
