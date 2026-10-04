import { useEffect, useState, type KeyboardEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRIORITIES,
  domainFrom,
  suggestKeywords,
  useMyWorkspace,
  type PriorityId,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/intelligence-setup")({
  head: () => ({
    meta: [
      { title: "Set up your workspace — SYAN Intelligence" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupWizard,
});

const STEPS = ["Organisation", "Keywords", "Competitors", "Priorities", "Done"];

const orgSchema = z.object({
  name: z.string().trim().min(2, "Please enter your organisation's name").max(160),
  website: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || domainFrom(v) !== "", "That doesn't look like a web address"),
});

function TagInput({
  values,
  onChange,
  placeholder,
  max = 30,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim().slice(0, 100);
    if (!v || values.length >= max) return;
    if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  }
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" className="rounded-full" onClick={add}>
          Add
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {values.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing added yet.</p>
        )}
        {values.map((v) => (
          <span key={v} className="pill inline-flex items-center gap-2">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SetupWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existing, isLoading } = useMyWorkspace();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [suggestedFor, setSuggestedFor] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<PriorityId[]>(["reputation", "media_coverage", "sentiment"]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Already set up: go straight to the Overview.
  useEffect(() => {
    if (existing && step < 4) navigate({ to: "/intelligence/overview", replace: true });
  }, [existing, step, navigate]);

  function next() {
    setError(null);
    if (step === 0) {
      const r = orgSchema.safeParse({ name, website });
      if (!r.success) return setError(r.error.issues[0]?.message ?? "Please check your details");
      const key = `${name}|${website}`;
      if (key !== suggestedFor) {
        setKeywords(suggestKeywords(name, website));
        setSuggestedFor(key);
      }
    }
    if (step === 1 && keywords.length === 0) return setError("Add at least one name or keyword to monitor.");
    if (step === 3) {
      if (priorities.length === 0) return setError("Choose at least one priority.");
      return finish();
    }
    setStep((s) => s + 1);
  }

  async function finish() {
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSaving(false);
      return setError("Your session has ended. Please sign in again.");
    }
    const domain = domainFrom(website);
    const { error: err } = await supabase.from("intelligence_workspaces").insert({
      owner_id: auth.user.id,
      organisation_name: name.trim(),
      website: domain ? `https://${domain}` : null,
      keywords,
      competitors,
      priorities,
    });
    setSaving(false);
    if (err) return setError("We couldn't save your workspace. Please try again.");
    setStep(4);
  }

  async function goToOverview() {
    await queryClient.invalidateQueries({ queryKey: ["intelligence-workspace"] });
    navigate({ to: "/intelligence/overview" });
  }

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-hairline bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-serif text-lg font-bold">SYAN</Link>
          <span className="eyebrow">SYAN Intelligence</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <ol className="mb-8 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                i === step
                  ? "border-navy bg-navy text-navy-foreground"
                  : i < step
                    ? "border-hairline text-foreground"
                    : "border-hairline text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <div className="soft-card p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="display-lg text-3xl">Tell us about your organisation</h1>
                <p className="mt-2 text-sm text-muted-foreground">This takes about two minutes. You can change everything later.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org">Organisation name</Label>
                <Input id="org" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ethica Microfinance Bank" maxLength={160} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="web">Website <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. ethicabank.com" maxLength={300} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="display-lg text-3xl">What should we listen for?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've suggested names people might use when talking about you. Remove any that don't fit, and add
                  product names, campaigns or spokespeople.
                </p>
              </div>
              <TagInput values={keywords} onChange={setKeywords} placeholder="Add a name or keyword, then press Enter" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="display-lg text-3xl">Who are your competitors?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Add the organisations you most often get compared with. You can skip this for now.</p>
              </div>
              <TagInput values={competitors} onChange={setCompetitors} placeholder="Competitor name" max={15} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="display-lg text-3xl">What matters most to you?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Pick as many as you like. We'll shape your Overview around these.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {PRIORITIES.map((p) => {
                  const on = priorities.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPriorities(on ? priorities.filter((x) => x !== p.id) : [...priorities, p.id])}
                      className={`rounded-2xl border p-4 text-left transition ${on ? "border-navy bg-navy/5" : "border-hairline hover:border-foreground/30"}`}
                    >
                      <span className="flex items-center justify-between font-semibold">
                        {p.label}
                        <span className={`grid h-5 w-5 place-items-center rounded-full border text-xs ${on ? "border-navy bg-navy text-navy-foreground" : "border-hairline"}`}>
                          {on ? "✓" : ""}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{p.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <h1 className="display-lg text-3xl">Your Intelligence workspace is ready.</h1>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                We'll monitor {keywords.length} name{keywords.length === 1 ? "" : "s"} and keyword{keywords.length === 1 ? "" : "s"}
                {competitors.length ? ` alongside ${competitors.length} competitor${competitors.length === 1 ? "" : "s"}` : ""} for {name.trim()}.
                Results will appear as soon as monitoring sources are connected.
              </p>
              <Button className="rounded-full" onClick={goToOverview}>Go to Overview</Button>
            </div>
          )}

          {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}

          {step < 4 && (
            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" className="rounded-full" disabled={step === 0 || saving} onClick={() => { setError(null); setStep((s) => s - 1); }}>
                Back
              </Button>
              <div className="flex gap-2">
                {step === 2 && competitors.length === 0 && (
                  <Button variant="outline" className="rounded-full" onClick={() => setStep(3)}>Skip</Button>
                )}
                <Button className="rounded-full" disabled={saving} onClick={next}>
                  {step === 3 ? (saving ? "Setting up…" : "Finish setup") : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
