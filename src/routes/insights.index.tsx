import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { articlesQuery, formatArticleDate } from "@/lib/articles.functions";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Insights — SYAN Media" },
      {
        name: "description",
        content:
          "Editorial thinking on reputation, AI search visibility, crisis communications and media intelligence from the SYAN Media desk.",
      },
      { property: "og:title", content: "Insights — SYAN Media" },
      {
        property: "og:description",
        content: "Reputation, AI visibility, crisis and intelligence thinking from SYAN Media.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery),
  pendingComponent: () => (
    <SiteLayout>
      <Section>
        <div className="soft-card h-64 animate-pulse" />
      </Section>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <Section>
        <p className="text-muted-foreground">Insights couldn't be loaded right now. Please try again shortly.</p>
      </Section>
    </SiteLayout>
  ),
  component: InsightsIndex,
});

function InsightsIndex() {
  const { data: insights } = useSuspenseQuery(articlesQuery);
  const lead = insights[0];
  const rest = insights.slice(1);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Insights"
        title="Thinking from the desk."
        intro="Notes on reputation, discovery and measurement — written for people who own the narrative."
      />

      <Section>
        {!lead ? (
          <p className="text-muted-foreground">New insights are on the way. Check back soon.</p>
        ) : (
          <>
            <Link
              to="/insights/$slug"
              params={{ slug: lead.slug }}
              className="group block overflow-hidden rounded-2xl border border-hairline"
            >
              {lead.coverUrl && (
                <img src={lead.coverUrl} alt="" className="aspect-[21/9] w-full object-cover" />
              )}
              <div className="p-10">
                <p className="eyebrow">{lead.category}</p>
                <h2 className="display-lg mt-5 max-w-3xl group-hover:text-accent">{lead.title}</h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {lead.excerpt}
                </p>
                <p className="num mt-7 text-[11px] text-muted-foreground">
                  {formatArticleDate(lead.date)}
                  {lead.readingTime ? ` · ${lead.readingTime}` : ""}
                </p>
              </div>
            </Link>

            <div className="mt-px grid gap-5 md:grid-cols-3">
              {rest.map((i) => (
                <Link
                  key={i.slug}
                  to="/insights/$slug"
                  params={{ slug: i.slug }}
                  className="group soft-card p-8"
                >
                  <p className="eyebrow">{i.category}</p>
                  <p className="mt-4 font-serif font-bold text-xl leading-snug group-hover:text-accent">
                    {i.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.excerpt}</p>
                  <p className="num mt-6 text-[11px] text-muted-foreground">
                    {formatArticleDate(i.date)}
                    {i.readingTime ? ` · ${i.readingTime}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Section>
    </SiteLayout>
  );
}
