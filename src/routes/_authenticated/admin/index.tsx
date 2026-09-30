import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function useCount(table: "project_alerts" | "intelligence_reports" | "project_keywords") {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function AdminOverview() {
  const { data: projects = [], isLoading } = useProjects();
  const alerts = useCount("project_alerts");
  const reports = useCount("intelligence_reports");
  const keywords = useCount("project_keywords");

  const cards = [
    { label: "Intelligence projects", value: projects.length },
    { label: "Monitoring keywords", value: keywords.data ?? 0 },
    { label: "Open alerts", value: alerts.data ?? 0 },
    { label: "Reports", value: reports.data ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Intelligence control room</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure client projects, monitoring inputs and delivery. Live metrics appear only once a
          data provider is connected — nothing here is simulated.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="soft-card p-6">
            <p className="num display-lg text-3xl text-navy">{c.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="soft-card p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-xl font-bold">Recent projects</h2>
          <Link to="/admin/projects" className="text-sm font-semibold underline underline-offset-4">
            Manage projects
          </Link>
        </div>
        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No intelligence projects yet. Create one to define keywords, competitors and sources.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-hairline">
            {projects.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    to="/admin/projects/$id"
                    params={{ id: p.id }}
                    className="font-semibold hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.client_name}</p>
                </div>
                <span className="rounded-full border border-hairline px-3 py-1 text-xs">
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
