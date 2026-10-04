import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Primitives";
import { articlesQuery, formatArticleDate, getPublishedArticle } from "@/lib/articles.functions";

export const Route = createFileRoute("/insights/$slug")({
  loader: async ({ params }) => {
    const insight = await getPublishedArticle({ data: { slug: params.slug } });
    if (!insight) throw notFound();
    return { insight };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Insight unavailable — SYAN Media" }, { name: "robots", content: "noindex" }],
      };
    }
    const { insight } = loaderData;
    const title = insight.seoTitle || `${insight.title} — SYAN Media Insights`;
    const description = insight.seoDescription || insight.excerpt || insight.title;
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: insight.seoTitle || insight.title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    return { meta };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <p className="font-serif text-2xl font-bold">This insight isn't available.</p>
        <Link to="/insights" className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4">
          Back to all insights
        </Link>
      </Section>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <Section>
        <p className="text-muted-foreground">This insight couldn't be loaded right now. Please try again shortly.</p>
      </Section>
    </SiteLayout>
  ),
  component: InsightDetail,
});

function InsightDetail() {
  const { insight } = Route.useLoaderData();
  const { data: all = [] } = useQuery(articlesQuery);
  const more = all.filter((i) => i.slug !== insight.slug).slice(0, 3);
  const paragraphs = (insight.body ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <SiteLayout>
      <article>
        <div className="obsidian border-b border-white/10">
          <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-28">
            <p className="eyebrow text-[color:var(--gold)]">{insight.category}</p>
            <h1 className="display-lg mt-6 text-navy-foreground">{insight.title}</h1>
            <p className="num mt-8 text-[11px] text-white/50">
              {formatArticleDate(insight.date)}
              {insight.readingTime ? ` · ${insight.readingTime}` : ""}
              {insight.author ? ` · ${insight.author}` : ""}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          {insight.coverUrl && (
            <img src={insight.coverUrl} alt="" className="mb-12 aspect-[16/9] w-full rounded-2xl object-cover" />
          )}
          {insight.excerpt && (
            <p className="font-serif font-bold text-xl leading-relaxed text-foreground">{insight.excerpt}</p>
          )}
          <div className="rule-gold my-10" />
          <div className="space-y-6 text-base leading-[1.85] text-muted-foreground">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
          {insight.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {insight.tags.map((t) => (
                <span key={t} className="rounded-full border border-hairline px-3 py-1 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-14 rounded-2xl border border-hairline p-8">
            <p className="font-serif font-bold text-xl">Want this applied to your organisation?</p>
            <Link
              to="/contact"
              className="mt-5 inline-flex bg-navy px-6 py-3 rounded-full text-sm font-semibold text-navy-foreground hover:bg-windsor"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <div className="border-t border-hairline bg-secondary">
          <Section>
            <p className="eyebrow">More insights</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {more.map((i) => (
                <Link
                  key={i.slug}
                  to="/insights/$slug"
                  params={{ slug: i.slug }}
                  className="soft-card p-8 hover:text-accent"
                >
                  <p className="eyebrow">{i.category}</p>
                  <p className="mt-3 font-serif font-bold text-lg leading-snug">{i.title}</p>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      )}
    </SiteLayout>
  );
}
