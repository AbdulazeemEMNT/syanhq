import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/intelligence/reports")({
  component: Reports,
});

type ReportRow = {
  id: string;
  title: string;
  report_type: string;
  status: string;
  summary: string | null;
  created_at: string;
  project?: { name: string } | null;
};

function Reports() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["intelligence_reports", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_reports")
        .select("*, project:intelligence_projects(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as ReportRow[];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Weekly, monthly, campaign, reputation, competitor and AI visibility reports. Generated
          report bodies arrive once the provider pipeline is connected.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : reports.length === 0 ? (
        <div className="soft-card p-8">
          <p className="font-serif text-lg font-bold">No reports yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reports are created per project.{" "}
            <Link
              to="/intelligence/projects"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Open a project
            </Link>{" "}
            to create one.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="soft-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">{r.project?.name ?? "Project"}</p>
                  <p className="mt-1 font-serif text-base font-bold">{r.title}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full border border-hairline px-3 py-1 text-xs">
                    {r.report_type} · {r.status}
                  </span>
                  <p className="num mt-2 text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {r.summary && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
