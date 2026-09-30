import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/alerts/")({
  component: AlertsPage,
});

function AlertsPage() {
  const { data: projects = [] } = useProjects();
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["all-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_alerts")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Project";

  return (
    <div className="soft-card p-8">
      <h1 className="font-serif text-2xl font-bold">All reputation alerts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Across every project. Log new alerts from inside a project.
      </p>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && alerts.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No alerts recorded yet. Once monitoring sources are connected, risks will appear here.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {alerts.map((a) => (
          <li key={a.id} className="rounded-2xl border border-hairline p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link
                  to="/admin/projects/$id"
                  params={{ id: a.project_id }}
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-accent"
                >
                  {projectName(a.project_id)}
                </Link>
                <p className="mt-1 font-serif text-base font-bold">{a.title}</p>
              </div>
              <span className="rounded-full border border-hairline px-3 py-1 text-xs">
                {a.severity} · {a.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.what_happened ?? ""}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
