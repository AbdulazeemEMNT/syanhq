import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_mentions",
  title: "List monitored mentions",
  description: "List real monitored media mentions you can access, with optional sentiment, topic and date filters.",
  inputSchema: {
    sentiment: z.enum(["positive", "neutral", "negative"]).optional().describe("Only this sentiment."),
    topic: z.string().trim().min(1).optional().describe("Only this topic."),
    days: z.number().int().min(1).max(365).optional().describe("Only mentions from the last N days."),
    sort: z.enum(["recent", "relevant", "reach"]).optional().describe("Sort order (default recent)."),
    limit: z.number().int().min(1).max(100).optional().describe("Max results (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ sentiment, topic, days, sort, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("intelligence_mentions")
      .select("id, source_name, published_at, title, author, sentiment, topic, reach, relevance, url, excerpt")
      .is("subject", null);
    if (sentiment) q = q.eq("sentiment", sentiment);
    if (topic) q = q.ilike("topic", topic);
    if (days) q = q.gte("published_at", new Date(Date.now() - days * 86400000).toISOString());
    const col = sort === "relevant" ? "relevance" : sort === "reach" ? "reach" : "published_at";
    const { data, error } = await q.order(col, { ascending: false, nullsFirst: false }).limit(limit ?? 25);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const mentions = (data ?? []).map((m) => ({
      id: m.id,
      source: m.source_name,
      published_at: m.published_at,
      title: m.title,
      author: m.author,
      sentiment: m.sentiment,
      topic: m.topic,
      reach: m.reach,
      relevance: m.relevance,
      url: m.url,
      excerpt: m.excerpt,
    }));
    return {
      content: [{ type: "text", text: mentions.length ? JSON.stringify(mentions) : "No mentions found." }],
      structuredContent: { mentions },
    };
  },
});
