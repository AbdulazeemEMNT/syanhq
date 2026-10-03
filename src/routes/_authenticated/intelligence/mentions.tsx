import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/intelligence/mentions")({
  component: Mentions,
});

type AlertRow = {
  id: string;
  title: string;
  severity: string;
  status: string;
  what_happened: string | null;
  why_it_matters: string | null;
  what_changed: string | null;
  recommended_action: string | null;
  detected_at: string;
  project?: { name: string } | null;
};

function Mentions() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["project_alerts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_alerts")
        .select("*, project:intelligence_projects(name)")
        .order("detected_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as AlertRow[];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Mentions & alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every alert states what happened, why it matters, what changed and the recommended action.
          Live mentions appear only once a data provider is connected — nothing here is simulated.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="soft-card p-8">
          <p className="font-serif text-lg font-bold">No alerts recorded yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Alerts are logged per project.{" "}
            <Link
              to="/intelligence/projects"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Open a project
            </Link>{" "}
            to register its monitoring keywords and data sources.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {alerts.map((a) => (
            <li key={a.id} className="soft-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">{a.project?.name ?? "Project"}</p>
                  <p className="mt-1 font-serif text-base font-bold">{a.title}</p>
                </div>
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
              <p className="num mt-4 text-[11px] text-muted-foreground">
                {new Date(a.detected_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
