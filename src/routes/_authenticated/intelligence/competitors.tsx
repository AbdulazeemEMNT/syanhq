import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/intelligence/competitors")({
  component: Competitors,
});

type CompetitorRow = {
  id: string;
  name: string;
  domain: string | null;
  project_id: string;
  project?: { name: string } | null;
};

function Competitors() {
  const { data: competitors = [], isLoading } = useQuery({
    queryKey: ["project_competitors", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_competitors")
        .select("*, project:intelligence_projects(name)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CompetitorRow[];
    },
  });

  const byProject = competitors.reduce<Record<string, CompetitorRow[]>>((acc, c) => {
    const name = c.project?.name ?? "Project";
    (acc[name] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Competitors</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The brands benchmarked against each client for share of voice and narrative comparison.
          Share-of-voice metrics appear only once a data provider is connected.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : competitors.length === 0 ? (
        <div className="soft-card p-8">
          <p className="font-serif text-lg font-bold">No competitor sets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Competitors are defined per project.{" "}
            <Link
              to="/intelligence/projects"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Open a project
            </Link>{" "}
            to build its competitor set.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byProject).map(([project, rows]) => (
            <div key={project} className="soft-card p-8">
              <h2 className="font-serif text-xl font-bold">{project}</h2>
              <ul className="mt-5 divide-y divide-hairline">
                {rows.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-muted-foreground">{c.domain ?? "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
