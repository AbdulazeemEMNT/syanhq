import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { services, insights, team, careers } from "@/content/site";
import { worksQuery } from "@/routes/work.index";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — SYAN Media" },
      {
        name: "description",
        content: "Search SYAN Media services, case studies, insights, team and open roles.",
      },
      { property: "og:title", content: "Search — SYAN Media" },
      { property: "og:description", content: "Find services, work and insights across SYAN Media." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

type Result = { title: string; kind: string; text: string; to: string; params?: { slug: string } };

const staticIndex: Result[] = [
  ...services.map((s) => ({
    title: s.name,
    kind: "Service",
    text: `${s.summary} ${s.capabilities.map((c) => c.title).join(" ")}`,
    to: "/services/$slug",
    params: { slug: s.slug },
  })),
  ...insights.map((i) => ({
    title: i.title,
    kind: "Insight",
    text: `${i.excerpt} ${i.category}`,
    to: "/insights/$slug",
    params: { slug: i.slug },
  })),
  ...team.map((m) => ({ title: m.name, kind: "Team", text: `${m.role} ${m.focus}`, to: "/team" })),
  ...careers.map((c) => ({
    title: c.title,
    kind: "Career",
    text: `${c.detail} ${c.location}`,
    to: "/careers",
  })),
  {
    title: "SYAN Intelligence",
    kind: "Product",
    text: "Media listening sentiment narrative reputation alerts AI visibility monitoring",
    to: "/intelligence",
  },
];

function SearchPage() {
  const [query, setQuery] = useState("");
  const { data: works = [] } = useQuery(worksQuery);

  const index = useMemo<Result[]>(
    () => [
      ...staticIndex,
      ...works.map((c) => ({
        title: c.client,
        kind: "Case study",
        text: `${c.headline} ${c.summary} ${c.sector}`,
        to: "/work/$slug",
        params: { slug: c.slug },
      })),
    ],
    [works],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter(
      (r) => r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Search"
        title="Find anything on SYAN."
        intro="Services, case studies, insights, people and open roles."
      />
      <Section>
        <div className="flex items-center gap-3 rounded-xl border border-hairline bg-card px-5 py-4">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SYAN Media…"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>

        <div className="mt-10">
          {query.trim() === "" ? (
            <p className="text-sm text-muted-foreground">
              Start typing — try “crisis”, “AI visibility” or “launch”.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No results for “{query}”. Try a different term or{" "}
              <Link to="/contact" className="text-accent hover:underline">
                ask us directly
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-px bg-hairline">
              {results.map((r) => (
                <Link
                  key={`${r.kind}-${r.title}`}
                  to={r.to as never}
                  params={r.params as never}
                  className="block soft-card p-6 hover:text-accent"
                >
                  <p className="eyebrow">{r.kind}</p>
                  <p className="mt-2 font-serif font-bold text-lg">{r.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    </SiteLayout>
  );
}
