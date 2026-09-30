import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: projects = [] } = useProjects();
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["all-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Project";

  return (
    <div className="soft-card p-8">
      <h1 className="font-serif text-2xl font-bold">Reports</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Weekly, monthly, campaign, reputation, competitor and AI visibility reports across projects.
        Create reports from inside a project.
      </p>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && reports.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No reports created yet.</p>
      )}

      <ul className="mt-6 divide-y divide-hairline">
        {reports.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-serif text-base font-bold">{r.title}</p>
              <p className="text-xs text-muted-foreground">
                <Link
                  to="/admin/projects/$id"
                  params={{ id: r.project_id }}
                  className="underline underline-offset-2"
                >
                  {projectName(r.project_id)}
                </Link>{" "}
                · {r.report_type} · {r.status}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
