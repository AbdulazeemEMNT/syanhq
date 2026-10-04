import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

type MessageRow = {
  id: string;
  name: string;
  organisation: string | null;
  email: string;
  interest: string | null;
  status: string;
  created_at: string;
};

function useCount(
  table: "cms_case_studies" | "cms_articles" | "cms_careers" | "contact_messages",
  status?: string,
) {
  return useQuery({
    queryKey: ["count", table, status ?? "all"],
    queryFn: async () => {
      let q = supabase.from(table).select("*", { count: "exact", head: true });
      if (status) q = q.eq("status", status);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function AdminOverview() {
  const works = useCount("cms_case_studies");
  const articles = useCount("cms_articles");
  const careers = useCount("cms_careers");
  const unread = useCount("contact_messages", "new");

  const { data: recentMessages = [] } = useQuery({
    queryKey: ["contact_messages", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as MessageRow[];
    },
  });

  const cards = [
    { label: "Case studies", value: works.data ?? 0, to: "/admin/works" },
    { label: "Articles", value: articles.data ?? 0, to: "/admin/articles" },
    { label: "Roles", value: careers.data ?? 0, to: "/admin/careers" },
    { label: "Unread messages", value: unread.data ?? 0, to: "/admin/messages" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Website content</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage what the public site shows — case studies, articles, careers and incoming
          enquiries. Client intelligence work lives separately in{" "}
          <Link
            to="/intelligence/overview"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            SYAN Intelligence
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="soft-card p-6 transition-colors hover:bg-secondary">
            <p className="num display-lg text-3xl text-navy">{c.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="soft-card p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-xl font-bold">Latest enquiries</h2>
          <Link to="/admin/messages" className="text-sm font-semibold underline underline-offset-4">
            View all messages
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No enquiries yet. Messages submitted through the contact form appear here.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-hairline">
            {recentMessages.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.organisation || m.email} · {m.interest ?? "General"}
                  </p>
                </div>
                <span className="rounded-full border border-hairline px-3 py-1 text-xs">
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
