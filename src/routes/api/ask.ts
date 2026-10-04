import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!url || !key || !apiKey) return new Response("Assistant is not configured", { status: 500 });
        if (token.split(".").length !== 3) return new Response("Unauthorized", { status: 401 });

        const db = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            headers: { Authorization: `Bearer ${token}` },
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: claims, error: authErr } = await db.auth.getClaims(token);
        if (authErr || !claims?.claims?.sub) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
        if (!body || !Array.isArray(body.messages)) return new Response("Invalid request", { status: 400 });

        const { streamText, convertToModelMessages, stepCountIs } = await import("ai");
        const { createOpenAI } = await import("@ai-sdk/openai");
        const { buildAskTools, ASK_SYSTEM } = await import("@/lib/ask-syan.server");

        const messages = body.messages as Parameters<typeof convertToModelMessages>[0];
        const { tools, organisation } = await buildAskTools(db);

        let runId: string | undefined;
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: async (u, init) => {
            const headers = new Headers(init?.headers);
            if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
            const res = await fetch(u, { ...init, headers });
            runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
            return res;
          },
        });

        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          system: ASK_SYSTEM(organisation, new Date().toISOString().slice(0, 10)),
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(50),
          abortSignal: request.signal,
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

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: false,
          onError: (e) => {
            const msg = e instanceof Error ? e.message : String(e);
            if (/402|credit/i.test(msg)) return "Your workspace has run out of AI credits. Add credits and try again.";
            if (/429|rate/i.test(msg)) return "Too many requests right now. Please wait a moment and try again.";
            console.error("[ask-syan]", msg);
            return "Ask SYAN couldn't answer just now. Please try again.";
          },
        });
      },
    },
  },
});
