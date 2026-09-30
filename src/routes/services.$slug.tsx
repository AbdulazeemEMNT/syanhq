import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { getService, services, caseStudies } from "@/content/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Service not found — SYAN Media" }, { name: "robots", content: "noindex" }],
      };
    }
    const { service } = loaderData;
    return {
      meta: [
        { title: `${service.name} — SYAN Media` },
        { name: "description", content: service.summary },
        { property: "og:title", content: `${service.name} — SYAN Media` },
        { property: "og:description", content: service.summary },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const work = caseStudies.filter((c) => c.services.includes(service.name)).slice(0, 3);

  return (
    <SiteLayout>
      <PageHero eyebrow={service.group} title={service.name} intro={service.summary} />

      <Section className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow">Capabilities</p>
          <div className="mt-8 space-y-px bg-hairline">
            {service.capabilities.map((c, i) => (
              <div key={c.title} className="soft-card p-7">
                <div className="flex gap-5">
                  <span className="num text-xs text-accent">0{i + 1}</span>
                  <div>
                    <p className="font-serif font-bold text-lg">{c.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-10">
          <div className="rounded-2xl border border-hairline p-7">
            <p className="eyebrow">What you get</p>
            <ul className="mt-5 space-y-3 text-sm">
              {service.outcomes.map((o) => (
                <li key={o} className="border-b border-hairline pb-3 text-muted-foreground">
                  {o}
                </li>
              ))}
            </ul>
          </div>
          <div className="obsidian p-7">
            <p className="font-serif font-bold text-xl text-navy-foreground">Ready to start?</p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Tell us what you are launching, defending or scaling.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex border border-[color:var(--gold)] px-6 py-3 rounded-full text-sm font-semibold text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-navy"
            >
              Start a Conversation
            </Link>
          </div>
        </aside>
      </Section>

      {work.length > 0 && (
        <div className="border-y border-hairline bg-secondary">
          <Section>
            <p className="eyebrow">Selected work</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {work.map((c) => (
                <Link
                  key={c.slug}
                  to="/work/$slug"
                  params={{ slug: c.slug }}
                  className="soft-card p-8 hover:text-accent"
                >
                  <p className="eyebrow">{c.sector}</p>
                  <p className="mt-3 font-serif font-bold text-lg">{c.client}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{c.headline}</p>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      )}

      <Section>
        <p className="eyebrow">Related services</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {related.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="soft-card p-8 hover:text-accent"
            >
              <p className="eyebrow">{s.group}</p>
              <p className="mt-3 font-serif font-bold text-lg">{s.name}</p>
            </Link>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
