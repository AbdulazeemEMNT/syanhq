import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.object({
  title: z.string().trim().min(2).max(160),
  department: z.string().trim().max(120).default(""),
  employment_type: z.string().trim().max(60).default(""),
  location: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(3000).default(""),
});

export type JobDraft = {
  short_description: string;
  full_description: string;
  responsibilities: string[];
  requirements: string[];
};

export const draftJobDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }): Promise<JobDraft> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only admins can draft job descriptions.");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");

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
        if (res.status === 402) throw new Error("AI credits are exhausted. Add credits in Settings → Plans & credits.");
        if (res.status === 429) throw new Error("AI is busy right now. Please try again in a minute.");
        return res;
      },
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "You write job adverts for SYAN Media, a Lagos-based reputation, media relations, search/AI visibility and intelligence agency. Write in confident, precise British English. Return ONLY a JSON object with keys: short_description (1-2 sentences, max 220 chars), full_description (2-3 short paragraphs), responsibilities (5-8 strings), requirements (5-8 strings). No markdown.",
      prompt: `Job title: ${data.title}\nDepartment: ${data.department || "-"}\nEmployment type: ${data.employment_type || "-"}\nLocation: ${data.location || "-"}\nRole notes: ${data.notes || "-"}`,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The AI returned an unexpected response. Please try again.");
    let parsed: Partial<JobDraft>;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error("The AI returned an unexpected response. Please try again.");
    }
    const list = (v: unknown) => (Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 10) : []);
    return {
      short_description: String(parsed.short_description ?? "").slice(0, 400),
      full_description: String(parsed.full_description ?? ""),
      responsibilities: list(parsed.responsibilities),
      requirements: list(parsed.requirements),
    };
  });
