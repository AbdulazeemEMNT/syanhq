import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProject, type Competitor, type Keyword, type Source } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/intelligence/projects/$id")({
  component: ProjectDetail,
});

type Tab = "keywords" | "competitors" | "sources" | "alerts" | "reports" | "ai";

const tabs: { id: Tab; label: string }[] = [
  { id: "keywords", label: "Keywords" },
  { id: "competitors", label: "Competitors" },
  { id: "sources", label: "Sources" },
  { id: "alerts", label: "Alerts" },
  { id: "reports", label: "Reports" },
  { id: "ai", label: "AI settings" },
];

function useRows<T>(table: string, projectId: string) {
  return useQuery({
    queryKey: [table, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as "project_keywords")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const { data: project, isLoading } = useProject(id);
  const [tab, setTab] = useState<Tab>("keywords");

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!project)
    return (
      <div className="soft-card p-8">
        <p className="font-serif text-lg font-bold">Project not found</p>
        <Link to="/intelligence/projects" className="mt-3 inline-block text-sm underline">
          Back to projects
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="soft-card p-8">
        <Link to="/intelligence/projects" className="eyebrow">
          ← Projects
        </Link>
        <h1 className="display-lg mt-4 text-3xl">{project.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {project.client_name}
          {project.markets.length > 0 && ` · ${project.markets.join(", ")}`}
        </p>
        {project.description && <p className="mt-4 max-w-2xl text-sm">{project.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              tab === t.id
                ? "border-navy bg-navy text-navy-foreground"
                : "border-hairline bg-card text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "keywords" && <KeywordsTab projectId={id} />}
      {tab === "competitors" && <CompetitorsTab projectId={id} />}
      {tab === "sources" && <SourcesTab projectId={id} />}
      {tab === "alerts" && <AlertsTab projectId={id} />}
      {tab === "reports" && <ReportsTab projectId={id} />}
      {tab === "ai" && <AiTab projectId={id} />}
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="soft-card p-8">
      <h2 className="font-serif text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function KeywordsTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useRows<Keyword>("project_keywords", projectId);
  const [keyword, setKeyword] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("project_keywords").insert({ project_id: projectId, keyword });
    if (error) {
      toast.error(error.message);
      return;
    }
    setKeyword("");
    qc.invalidateQueries({ queryKey: ["project_keywords", projectId] });
  }

  async function remove(rowId: string) {
    await supabase.from("project_keywords").delete().eq("id", rowId);
    qc.invalidateQueries({ queryKey: ["project_keywords", projectId] });
  }

  return (
    <Panel title="Monitoring keywords" hint="Terms tracked across connected media and digital sources.">
      <form onSubmit={add} className="flex flex-wrap gap-3">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Brand name, executive, campaign hashtag"
          className="max-w-sm rounded-full"
          required
        />
        <Button type="submit" className="rounded-full">
          Add keyword
        </Button>
      </form>
      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No keywords configured yet.</p>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2">
          {data.map((k) => (
            <li
              key={k.id}
              className="flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-xs"
            >
              {k.keyword}
              <button onClick={() => remove(k.id)} className="text-destructive">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function CompetitorsTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useRows<Competitor>("project_competitors", projectId);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("project_competitors")
      .insert({ project_id: projectId, name, domain: domain || null });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setDomain("");
    qc.invalidateQueries({ queryKey: ["project_competitors", projectId] });
  }

  return (
    <Panel title="Competitor set" hint="Brands benchmarked for share of voice and narrative comparison.">
      <form onSubmit={add} className="flex flex-wrap gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Competitor name"
          className="max-w-xs rounded-full"
          required
        />
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="domain.com"
          className="max-w-xs rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Add competitor
        </Button>
      </form>
      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No competitors added yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-hairline">
          {data.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-semibold">{c.name}</span>
              <span className="text-muted-foreground">{c.domain ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function SourcesTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useRows<Source>("project_sources", projectId);
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState("news");
  const [endpoint, setEndpoint] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("project_sources")
      .insert({ project_id: projectId, name, source_type: sourceType, endpoint: endpoint || null });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setEndpoint("");
    qc.invalidateQueries({ queryKey: ["project_sources", projectId] });
  }

  return (
    <Panel
      title="Data sources"
      hint="Register the feeds this project listens to. A source stays disconnected until a provider is wired up."
    >
      <form onSubmit={add} className="flex flex-wrap gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Source name"
          className="max-w-xs rounded-full"
          required
        />
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="rounded-full border border-hairline bg-card px-4 py-2 text-sm"
        >
          {["news", "rss", "social", "broadcast", "search", "ai-assistant"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="Feed or API endpoint"
          className="max-w-xs rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Add source
        </Button>
      </form>
      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No sources registered yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-hairline">
          {data.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-semibold">{s.name}</span>
              <span className="text-muted-foreground">
                {s.source_type} · {s.is_connected ? "connected" : "not connected"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AlertsTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["project_alerts", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_alerts")
        .select("*")
        .eq("project_id", projectId)
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({
    title: "",
    severity: "medium",
    what_happened: "",
    why_it_matters: "",
    what_changed: "",
    recommended_action: "",
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("project_alerts").insert({ project_id: projectId, ...form });
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({
      title: "",
      severity: "medium",
      what_happened: "",
      why_it_matters: "",
      what_changed: "",
      recommended_action: "",
    });
    qc.invalidateQueries({ queryKey: ["project_alerts", projectId] });
  }

  return (
    <Panel
      title="Reputation alerts"
      hint="Every alert states what happened, why it matters, what changed and the recommended action."
    >
      <form onSubmit={add} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-2 rounded-full"
            required
          />
        </div>
        <div>
          <Label>Severity</Label>
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
            className="mt-2 w-full rounded-full border border-hairline bg-card px-4 py-2 text-sm"
          >
            {["low", "medium", "high", "critical"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {(
          [
            ["what_happened", "What happened"],
            ["why_it_matters", "Why it matters"],
            ["what_changed", "What changed"],
            ["recommended_action", "Recommended action"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <Label>{label}</Label>
            <Textarea
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-2 rounded-2xl"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <Button type="submit" className="rounded-full">
            Log alert
          </Button>
        </div>
      </form>

      {data.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No alerts recorded for this project.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {data.map((a) => (
            <li key={a.id} className="rounded-2xl border border-hairline p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-serif text-base font-bold">{a.title}</p>
                <span className="rounded-full border border-hairline px-3 py-1 text-xs">
                  {a.severity} · {a.status}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                {[
                  ["What happened", a.what_happened],
                  ["Why it matters", a.why_it_matters],
                  ["What changed", a.what_changed],
                  ["Recommended action", a.recommended_action],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="eyebrow">{label}</dt>
                    <dd className="mt-1 text-muted-foreground">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ReportsTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["intelligence_reports", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_reports")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("weekly");
  const [summary, setSummary] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("intelligence_reports")
      .insert({ project_id: projectId, title, report_type: reportType, summary: summary || null });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setSummary("");
    qc.invalidateQueries({ queryKey: ["intelligence_reports", projectId] });
  }

  return (
    <Panel title="Reports" hint="Weekly, monthly, campaign, reputation, competitor and AI visibility reports.">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Report title"
          className="max-w-xs rounded-full"
          required
        />
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="rounded-full border border-hairline bg-card px-4 py-2 text-sm"
        >
          {["weekly", "monthly", "campaign", "reputation", "competitor", "ai-visibility"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary"
          className="max-w-sm rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Create report
        </Button>
      </form>
      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No reports created yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-hairline">
          {data.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.report_type} · {r.status}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AiTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["project_ai_settings", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_ai_settings")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [tone, setTone] = useState(data?.tone ?? "advisory");
  const [instructions, setInstructions] = useState(data?.instructions ?? "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("project_ai_settings")
      .upsert({ project_id: projectId, tone, instructions }, { onConflict: "project_id" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("AI settings saved");
    qc.invalidateQueries({ queryKey: ["project_ai_settings", projectId] });
  }

  return (
    <Panel
      title="AI strategic assistant"
      hint="Tone and standing instructions. The assistant answers only from data held for this project — it never invents metrics."
    >
      <form onSubmit={save} className="max-w-xl space-y-4">
        <div>
          <Label>Tone</Label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-2 w-full rounded-full border border-hairline bg-card px-4 py-2 text-sm"
          >
            {["advisory", "executive", "analytical", "plain"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Standing instructions</Label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Context the assistant should always apply for this client."
            className="mt-2 min-h-32 rounded-2xl"
          />
        </div>
        <Button type="submit" className="rounded-full">
          Save settings
        </Button>
      </form>
    </Panel>
  );
}
