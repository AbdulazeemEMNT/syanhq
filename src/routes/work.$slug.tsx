import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { getCaseStudy, caseStudies } from "@/content/site";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const study = getCaseStudy(params.slug);
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
      ],
    };
  },
  component: WorkDetail,
});

function WorkDetail() {
  const { study } = Route.useLoaderData();
  const more = caseStudies.filter((c) => c.slug !== study.slug).slice(0, 3);

  return (
    <SiteLayout>
      <PageHero eyebrow={study.sector} title={study.client} intro={study.headline} />

      <Section className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-12">
          <div>
            <p className="eyebrow">The challenge</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{study.challenge}</p>
          </div>
          <div>
            <p className="eyebrow">Our approach</p>
            <ul className="mt-5 space-y-3">
              {study.approach.map((a, i) => (
                <li key={a} className="flex gap-4 border-b border-hairline pb-3">
                  <span className="num text-xs text-accent">0{i + 1}</span>
                  <span className="text-sm text-muted-foreground">{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">What we delivered</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{study.summary}</p>
          </div>
        </div>
        <aside className="space-y-10">
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
          <div className="rounded-2xl border border-hairline p-7">
            <p className="eyebrow">Services applied</p>
            <ul className="mt-5 space-y-3 text-sm">
              {study.services.map((s) => (
                <li key={s} className="text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/contact"
            className="inline-flex bg-navy px-6 py-3 rounded-full text-sm font-semibold text-navy-foreground hover:bg-windsor"
          >
            Start a Conversation
          </Link>
        </aside>
      </Section>

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
    </SiteLayout>
  );
}
