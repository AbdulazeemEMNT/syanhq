import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { getPublishedWork, listPublishedWorks } from "@/lib/works.functions";

const workQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-work", slug],
    queryFn: () => getPublishedWork({ data: { slug } }),
  });

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params, context }) => {
    const study = await context.queryClient.ensureQueryData(workQuery(params.slug));
    if (!study) throw notFound();
    return { study };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Case study not found — SYAN Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { study } = loaderData;
    return {
      meta: [
        { title: `${study.client} — SYAN Media Case Study` },
        { name: "description", content: study.summary },
        { property: "og:title", content: `${study.client} — SYAN Media Case Study` },
        { property: "og:description", content: study.summary },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  pendingComponent: () => (
    <SiteLayout>
      <Section>
        <div className="h-10 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-secondary" />
      </Section>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <p className="eyebrow">Our Work</p>
        <p className="mt-4 font-serif text-2xl font-bold">This case study isn't available.</p>
        <Link to="/work" className="mt-6 inline-flex text-sm text-accent underline">
          See all work
        </Link>
      </Section>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <Section>
        <p className="font-serif text-2xl font-bold">We couldn't load this case study.</p>
        <button onClick={reset} className="mt-6 rounded-full border border-hairline px-5 py-2 text-sm">
          Try again
        </button>
      </Section>
    </SiteLayout>
  ),
  component: WorkDetail,
});

function Block({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function WorkDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(workQuery(slug));
  const study = data!;
  const { data: all = [] } = useQuery({
    queryKey: ["public-works"],
    queryFn: () => listPublishedWorks(),
  });
  const more = all.filter((c) => c.slug !== study.slug).slice(0, 3);
  const items = [...study.services, ...study.deliverables.filter((d) => !study.services.includes(d))];

  return (
    <SiteLayout>
      <PageHero eyebrow={study.sector} title={study.client} intro={study.headline} />

      {study.coverUrl && (
        <Section className="pb-0">
          <img src={study.coverUrl} alt={study.client} className="aspect-[21/9] w-full rounded-2xl object-cover" />
        </Section>
      )}

      {study.metrics.length > 0 && (
        <Section className="pb-0">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {study.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-hairline p-6">
                <p className="num font-serif text-3xl font-bold text-accent">{m.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-12">
          <Block label="The challenge" text={study.challenge} />
          <Block label="The brief" text={study.brief} />
          {(study.strategy || study.approach.length > 0) && (
            <div>
              <p className="eyebrow">Our approach</p>
              {study.strategy && (
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {study.strategy}
                </p>
              )}
              {study.approach.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {study.approach.map((a, i) => (
                    <li key={a} className="flex gap-4 border-b border-hairline pb-3">
                      <span className="num text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm text-muted-foreground">{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <Block label="Execution" text={study.execution} />
          <Block label="What we delivered" text={study.outcome_narrative || study.summary} />
          {study.testimonial && (
            <blockquote className="soft-card p-8">
              <p className="font-serif text-xl leading-snug">“{study.testimonial}”</p>
              {study.testimonial_author && (
                <p className="mt-4 text-sm text-muted-foreground">— {study.testimonial_author}</p>
              )}
            </blockquote>
          )}
        </div>
        <aside className="space-y-10">
          {study.results.length > 0 && (
            <div className="rounded-2xl border border-hairline p-7">
              <p className="eyebrow">Outcomes</p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {study.results.map((r) => (
                  <li key={r} className="border-b border-hairline pb-3">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {items.length > 0 && (
            <div className="rounded-2xl border border-hairline p-7">
              <p className="eyebrow">Services & deliverables</p>
              <ul className="mt-5 space-y-3 text-sm">
                {items.map((s) => (
                  <li key={s} className="text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {study.engagement_period && (
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Engagement: {study.engagement_period}
            </p>
          )}
          <Link
            to="/contact"
            className="inline-flex bg-navy px-6 py-3 rounded-full text-sm font-semibold text-navy-foreground hover:bg-windsor"
          >
            Start a Conversation
          </Link>
        </aside>
      </Section>

      {more.length > 0 && (
        <div className="border-t border-hairline bg-secondary">
          <Section>
            <p className="eyebrow">More work</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {more.map((c) => (
                <Link
                  key={c.slug}
                  to="/work/$slug"
                  params={{ slug: c.slug }}
                  className="soft-card p-8 hover:text-accent"
                >
                  <p className="eyebrow">{c.sector}</p>
                  <p className="mt-3 font-serif font-bold text-lg">{c.client}</p>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      )}
    </SiteLayout>
  );
}
