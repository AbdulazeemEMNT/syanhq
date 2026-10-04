import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission, usePermissions } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => (
    <RequirePermission permission="dashboard.view">
      <Dashboard />
    </RequirePermission>
  ),
});

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (v: string) =>
  new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function useStats() {
  return useQuery({
    queryKey: ["count", "dashboard"],
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [works, articles, careers, unread] = await Promise.all([
        supabase.from("cms_case_studies").select("id", head).eq("published", true).eq("archived", false),
        supabase.from("cms_articles").select("id", head).eq("published", true).eq("archived", false),
        supabase
          .from("cms_careers")
          .select("id", head)
          .eq("published", true)
          .eq("archived", false)
          .or(`closing_date.is.null,closing_date.gte.${today()}`),
        supabase.rpc("unread_message_count"),
      ]);
      const err = works.error || articles.error || careers.error || unread.error;
      if (err) throw err;
      return {
        works: works.count ?? 0,
        articles: articles.count ?? 0,
        careers: careers.count ?? 0,
        unread: (unread.data as number) ?? 0,
      };
    },
  });
}

function Dashboard() {
  const { data: perms = [] } = usePermissions();
  const stats = useStats();
  const canMessages = perms.includes("messages.manage");

  const works = useQuery({
    queryKey: ["cms_case_studies", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_case_studies")
        .select("id,headline,client,published,archived,updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
  const articles = useQuery({
    queryKey: ["cms_articles", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_articles")
        .select("id,title,author,published,archived,updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
  const messages = useQuery({
    queryKey: ["contact_messages", "recent"],
    enabled: canMessages,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id,name,enquiry_type,status,created_at")
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const s = stats.data;
  const cards = [
    { label: "Published works", value: s?.works, to: "/admin/works" as const },
    { label: "Published articles", value: s?.articles, to: "/admin/articles" as const },
    { label: "Open careers", value: s?.careers, to: "/admin/careers" as const },
    { label: "New messages", value: s?.unread, to: "/admin/messages" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          What's live on the website and what needs your attention.
        </p>
      </div>

      {stats.error ? (
        <p className="text-sm text-destructive">Couldn't load the numbers. Refresh to try again.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="soft-card p-6 transition-colors hover:bg-secondary">
              <p className="num display-lg text-3xl text-navy">{stats.isLoading ? "—" : c.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {canMessages && (
          <Panel title="Recent messages" to="/admin/messages" loading={messages.isLoading} error={!!messages.error}
            empty={messages.data?.length === 0 ? "No messages yet." : null}>
            {messages.data?.map((m) => (
              <Row key={m.id} title={m.name} sub={`${m.enquiry_type ?? "General enquiry"} · ${fmt(m.created_at)}`} status={m.status} />
            ))}
          </Panel>
        )}
        <Panel title="Recent works" to="/admin/works" loading={works.isLoading} error={!!works.error}
          empty={works.data?.length === 0 ? "No works yet." : null}>
          {works.data?.map((w) => (
            <Row key={w.id} title={w.headline || w.client} sub={`${w.client} · ${fmt(w.updated_at)}`}
              status={w.archived ? "archived" : w.published ? "published" : "draft"} />
          ))}
        </Panel>
        <Panel title="Recent articles" to="/admin/articles" loading={articles.isLoading} error={!!articles.error}
          empty={articles.data?.length === 0 ? "No articles yet." : null}>
          {articles.data?.map((a) => (
            <Row key={a.id} title={a.title} sub={`${a.author || "No author"} · ${fmt(a.updated_at)}`}
              status={a.archived ? "archived" : a.published ? "published" : "draft"} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel(props: {
  title: string;
  to: "/admin/messages" | "/admin/works" | "/admin/articles";
  loading: boolean;
  error: boolean;
  empty: string | null;
  children: ReactNode;
}) {
  return (
    <div className="soft-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold">{props.title}</h2>
        <Link to={props.to} className="text-xs font-semibold underline underline-offset-4">View all</Link>
      </div>
      {props.loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading…</p>
      ) : props.error ? (
        <p className="mt-5 text-sm text-destructive">Couldn't load this list.</p>
      ) : props.empty ? (
        <p className="mt-5 text-sm text-muted-foreground">{props.empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline">{props.children}</ul>
      )}
    </div>
  );
}

function Row({ title, sub, status }: { title: string; sub: string; status: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <StatusPill status={status} />
    </li>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "published" || status === "replied"
      ? "bg-navy text-navy-foreground border-navy"
      : status === "new"
        ? "border-accent text-accent"
        : "text-muted-foreground";
  return <span className={`shrink-0 rounded-full border border-hairline px-3 py-1 text-[11px] ${tone}`}>{status}</span>;
}
