import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { caseStudies, clientSectors } from "@/content/site";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Our Work — SYAN Media Case Studies" },
      {
        name: "description",
        content:
          "Selected SYAN Media case studies across banking, technology, energy, retail, government and community organisations.",
      },
      { property: "og:title", content: "Our Work — SYAN Media Case Studies" },
      {
        property: "og:description",
        content: "Over 25 industry leaders trust SYAN Media to tell their story.",
      },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our Work"
        title="Over 25 industry leaders and growing brands trust us to tell their story."
        intro="Whether launching a major product, handling sensitive public relations, or expanding across Nigeria — here is a selection of the work."
      />

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {caseStudies.map((c) => (
            <Link
              key={c.slug}
              to="/work/$slug"
              params={{ slug: c.slug }}
              className="group soft-card p-10 transition-colors hover:bg-secondary"
            >
              <p className="eyebrow">{c.sector}</p>
              <p className="mt-5 font-serif font-bold text-2xl leading-snug group-hover:text-accent">
                {c.client}
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.headline}</p>
              <p className="mt-6 flex flex-wrap gap-2">
                {c.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-hairline px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <div className="border-y border-hairline bg-secondary">
        <Section>
          <p className="eyebrow">Full client roster</p>
          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {clientSectors.map((s) => (
              <div key={s.sector}>
                <p className="font-serif font-bold text-lg">{s.sector}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {s.clients.map((c) => (
                    <li key={c} className="border-b border-hairline pb-2">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </SiteLayout>
  );
}
