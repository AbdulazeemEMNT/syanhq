import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects, slugify } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading, error } = useProjects();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [markets, setMarkets] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error: insertError } = await supabase.from("intelligence_projects").insert({
      name,
      slug: slugify(`${client}-${name}`),
      client_name: client,
      description: description || null,
      markets: markets
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    });
    setBusy(false);
    if (insertError) {
      toast.error(insertError.message);
      return;
    }
    toast.success("Project created");
    setName("");
    setClient("");
    setMarkets("");
    setDescription("");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  async function remove(id: string) {
    const { error: delError } = await supabase.from("intelligence_projects").delete().eq("id", id);
    if (delError) {
      toast.error(delError.message);
      return;
    }
    toast.success("Project deleted");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="soft-card p-8">
        <h1 className="font-serif text-2xl font-bold">Intelligence projects</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Each project holds the keywords, competitors and sources monitored for one client.
        </p>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}
        {!isLoading && projects.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            No projects yet. Create your first one, for example “ABC Bank — Reputation Monitoring”.
          </p>
        )}

        <ul className="mt-6 divide-y divide-hairline">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link
                  to="/admin/projects/$id"
                  params={{ id: p.id }}
                  className="font-serif text-lg font-bold hover:text-accent"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {p.client_name}
                  {p.markets.length > 0 && ` · ${p.markets.join(", ")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/projects/$id"
                  params={{ id: p.id }}
                  className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold"
                >
                  Configure
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs text-destructive"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={createProject} className="soft-card h-fit space-y-4 p-8">
        <h2 className="font-serif text-lg font-bold">New project</h2>
        <div>
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="ABC Bank"
            className="mt-2 rounded-full"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Project name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Reputation monitoring"
            className="mt-2 rounded-full"
            required
          />
        </div>
        <div>
          <Label htmlFor="markets">Markets (comma separated)</Label>
          <Input
            id="markets"
            value={markets}
            onChange={(e) => setMarkets(e.target.value)}
            placeholder="Nigeria, Ghana, Kenya"
            className="mt-2 rounded-full"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 rounded-2xl"
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-full">
          {busy ? "Creating…" : "Create project"}
        </Button>
      </form>
    </div>
  );
}
