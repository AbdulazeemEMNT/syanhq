import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/intelligence/integrations/")({
  component: IntegrationsPage,
});

const providers = [
  { provider: "media-monitoring", label: "Media monitoring API", category: "listening" },
  { provider: "social-listening", label: "Social listening platform", category: "listening" },
  { provider: "ai-assistants", label: "AI assistant probes (ChatGPT, Claude, Gemini, Perplexity)", category: "ai-visibility" },
  { provider: "email-delivery", label: "Email delivery for alert digests", category: "delivery" },
];

function IntegrationsPage() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("integrations").select("*");
      if (error) throw error;
      return data;
    },
  });
  const [busy, setBusy] = useState("");

  async function save(provider: string, category: string, notes: string) {
    setBusy(provider);
    const { error } = await supabase
      .from("integrations")
      .upsert({ provider, category, notes, status: "configured" }, { onConflict: "provider" });
    setBusy("");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Integration settings saved");
    qc.invalidateQueries({ queryKey: ["integrations"] });
  }

  return (
    <div className="space-y-6">
      <div className="soft-card p-8">
        <h1 className="font-serif text-2xl font-bold">Integrations &amp; API connections</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          SYAN Intelligence is provider-based: dashboards show live data only from the providers you
          connect here. Until a provider is connected, dashboards stay in their honest empty state.
        </p>
      </div>

      {providers.map((p) => (
        <IntegrationCard
          key={p.provider}
          {...p}
          existing={rows.find((r) => r.provider === p.provider)}
          busy={busy === p.provider}
          onSave={(notes) => save(p.provider, p.category, notes)}
        />
      ))}
    </div>
  );
}

function IntegrationCard({
  label,
  provider,
  existing,
  busy,
  onSave,
}: {
  label: string;
  provider: string;
  existing?: { status: string; notes: string | null; updated_at: string } | undefined;
  busy: boolean;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(existing?.notes ?? "");

  return (
    <div className="soft-card p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold">{label}</h2>
        <span className="rounded-full border border-hairline px-3 py-1 text-xs">
          {existing?.status ?? "not configured"}
        </span>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Provider name, account notes, endpoint details — connection credentials are stored securely, never in this field."
        className="mt-4 rounded-2xl"
      />
      <Button className="mt-4 rounded-full" disabled={busy} onClick={() => onSave(notes)}>
        {busy ? "Saving…" : "Save configuration"}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">Provider: {provider}</p>
    </div>
  );
}
