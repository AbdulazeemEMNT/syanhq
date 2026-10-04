import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getToolName, isToolUIPart } from "ai";
import { useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";

export const Route = createFileRoute("/_authenticated/intelligence/ask")({
  head: () => ({ meta: [{ title: "Ask SYAN — SYAN Intelligence" }] }),
  component: AskSyan,
});

const SUGGESTIONS = [
  "Summarise this week's coverage",
  "Why did sentiment change?",
  "What are people talking about?",
  "What should we pay attention to?",
];

const TOOL_LABELS: Record<string, string> = {
  getBrandSummary: "Checked coverage summary",
  getRecentMentions: "Read recent mentions",
  getSentiment: "Checked sentiment",
  getTopTopics: "Checked top topics",
  getCompetitorComparison: "Compared competitors",
  getReputationAlerts: "Checked reputation risks",
  getMediaSources: "Checked media sources",
};

function AskSyan() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ask",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const t = data.session?.access_token;
          return t ? { Authorization: `Bearer ${t}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "Ask SYAN couldn't answer just now."),
  });
  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() });
  };
  const onSubmit = (m: PromptInputMessage) => send(m.text ?? "");

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[520px] flex-col gap-4">
      <div>
        <h1 className="display-lg text-3xl">Ask SYAN</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Answers come only from your monitored coverage. If there isn't enough data, SYAN will say so.
        </p>
      </div>

      <div className="soft-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-serif text-xl font-bold text-primary-foreground">
                  S
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold">What would you like to know?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask about your coverage, sentiment, topics, competitors or reputation risks.
                </p>
                <Suggestions className="mt-6 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <Suggestion key={s} suggestion={s} onClick={send} />
                  ))}
                </Suggestions>
              </div>
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent
                    className={
                      m.role === "user"
                        ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                        : "bg-transparent"
                    }
                  >
                    {m.parts.map((p, i) => {
                      if (p.type === "text")
                        return m.role === "user" ? (
                          <span key={i}>{p.text}</span>
                        ) : (
                          <MessageResponse key={i}>{p.text}</MessageResponse>
                        );
                      if (isToolUIPart(p)) {
                        const name = getToolName(p);
                        return (
                          <Tool key={i} defaultOpen={false}>
                            <ToolHeader
                              type="dynamic-tool"
                              toolName={name}
                              title={TOOL_LABELS[name] ?? name}
                              state={p.state}
                            />
                            <ToolContent>
                              <ToolInput input={p.input} />
                              <ToolOutput output={p.output} errorText={p.errorText} />
                            </ToolContent>
                          </Tool>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent className="bg-transparent">
                  <Shimmer>Looking at your coverage…</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border p-3">
          <PromptInput onSubmit={onSubmit}>
            <PromptInputTextarea placeholder="Ask about your coverage…" autoFocus />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
