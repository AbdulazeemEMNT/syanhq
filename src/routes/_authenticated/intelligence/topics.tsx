import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/intelligence/topics")({
  component: Topics,
});

type KeywordRow = {
  id: string;
  keyword: string;
  project_id: string;
  project?: { name: string } | null;
};

function Topics() {
  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ["project_keywords", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_keywords")
        .select("*, project:intelligence_projects(name)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as KeywordRow[];
    },
  });

  const byProject = keywords.reduce<Record<string, KeywordRow[]>>((acc, k) => {
    const name = k.project?.name ?? "Project";
    (acc[name] ??= []).push(k);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Topics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The keywords and themes tracked across every project — brands, executives, campaigns and
          conversation topics.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : keywords.length === 0 ? (
        <div className="soft-card p-8">
          <p className="font-serif text-lg font-bold">No topics configured yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Keywords are defined per project.{" "}
            <Link
              to="/intelligence/projects"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Open a project
            </Link>{" "}
            to add the terms it monitors.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byProject).map(([project, rows]) => (
            <div key={project} className="soft-card p-8">
              <h2 className="font-serif text-xl font-bold">{project}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {rows.map((k) => (
                  <li
                    key={k.id}
                    className="rounded-full border border-hairline bg-secondary/60 px-4 py-2 text-xs"
                  >
                    {k.keyword}
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
