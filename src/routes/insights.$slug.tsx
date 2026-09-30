import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Primitives";
import { getInsight, insights } from "@/content/site";

export const Route = createFileRoute("/insights/$slug")({
  loader: ({ params }) => {
    const insight = getInsight(params.slug);
    if (!insight) throw notFound();
    return { insight };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Insight not found — SYAN Media" }, { name: "robots", content: "noindex" }],
      };
    }
    const { insight } = loaderData;
    return {
      meta: [
        { title: `${insight.title} — SYAN Media Insights` },
        { name: "description", content: insight.excerpt },
        { property: "og:title", content: insight.title },
        { property: "og:description", content: insight.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: InsightDetail,
});

function InsightDetail() {
  const { insight } = Route.useLoaderData();
  const more = insights.filter((i) => i.slug !== insight.slug).slice(0, 3);
  const date = new Date(insight.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SiteLayout>
      <article>
        <div className="obsidian border-b border-white/10">
          <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-28">
            <p className="eyebrow text-[color:var(--gold)]">{insight.category}</p>
            <h1 className="display-lg mt-6 text-navy-foreground">{insight.title}</h1>
            <p className="num mt-8 text-[11px] text-white/50">
              {date} · {insight.readingTime}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <p className="font-serif font-bold text-xl leading-relaxed text-foreground">{insight.excerpt}</p>
          <div className="rule-gold my-10" />
          <div className="space-y-6 text-base leading-[1.85] text-muted-foreground">
            {insight.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
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
    </SiteLayout>
  );
}
