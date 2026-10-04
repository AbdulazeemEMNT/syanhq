import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyRoles } from "@/lib/admin-data";
import { PRIORITIES, useMyWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/intelligence/settings")({
  head: () => ({ meta: [{ title: "Settings — SYAN Intelligence" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: ws } = useMyWorkspace();
  const { data: roles = [] } = useMyRoles();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">What we monitor for you, and who can see it.</p>
      </div>

      <div className="soft-card p-8">
        <h2 className="font-serif text-xl font-bold">Your organisation</h2>
        {ws ? (
          <dl className="mt-6 grid gap-6 md:grid-cols-2">
            <div><dt className="eyebrow">Name</dt><dd className="mt-2">{ws.organisation_name}</dd></div>
            <div><dt className="eyebrow">Website</dt><dd className="mt-2">{ws.website ?? "Not added"}</dd></div>
            <div><dt className="eyebrow">Names & keywords</dt><dd className="mt-2 flex flex-wrap gap-2">{ws.keywords.map((k) => <span key={k} className="pill">{k}</span>)}</dd></div>
            <div><dt className="eyebrow">Competitors</dt><dd className="mt-2 flex flex-wrap gap-2">{ws.competitors.length ? ws.competitors.map((k) => <span key={k} className="pill">{k}</span>) : <span className="text-sm text-muted-foreground">None added</span>}</dd></div>
            <div><dt className="eyebrow">Priorities</dt><dd className="mt-2 flex flex-wrap gap-2">{PRIORITIES.filter((p) => ws.priorities.includes(p.id)).map((p) => <span key={p.id} className="pill">{p.label}</span>)}</dd></div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No organisation set up yet. <Link to="/intelligence-setup" className="font-semibold underline underline-offset-4">Start setup</Link>
          </p>
        )}
      </div>

      <div className="soft-card p-8">
        <h2 className="font-serif text-xl font-bold">Monitoring sources</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          News sites, social platforms and broadcast monitoring are connected by the SYAN team. Once a source is
          connected, mentions start appearing on your Overview automatically.
        </p>
        <Link to="/contact" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Ask SYAN to connect a source</Link>
      </div>

      {roles.length > 0 && (
        <div className="soft-card p-8">
          <h2 className="font-serif text-xl font-bold">SYAN team tools</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/intelligence/projects" className="pill">Client projects</Link>
            <Link to="/intelligence/integrations" className="pill">Data sources</Link>
            <Link to="/intelligence/users" className="pill">Team access</Link>
          </div>
        </div>
      )}
    </div>
  );
}
