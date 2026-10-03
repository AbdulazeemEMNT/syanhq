import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section, SectionHeading } from "@/components/site/Primitives";
import { worksQuery } from "@/routes/work.index";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press Coverage — SYAN Media" },
      {
        name: "description",
        content:
          "National press moments delivered by SYAN Media across banking, technology, energy and consumer brands.",
      },
      { property: "og:title", content: "Press Coverage — SYAN Media" },
      {
        property: "og:description",
        content:
          "Coverage highlights from launches, rebrands and corporate storytelling programmes led by SYAN Media.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQuery),
  component: PressCoverage,
});

function PressCoverage() {
  const { data: works } = useSuspenseQuery(worksQuery);
  const pressCases = works.filter((c) =>
    c.services.some((s) => s.toLowerCase().includes("media coverage")),
  );
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Press Coverage"
        title="Moments the national press carried."
        intro="A selection of launches, rebrands and corporate stories we placed across Nigeria's leading desks."
      />

      <Section>
        {pressCases.length === 0 ? (
          <div className="soft-card p-10 text-center">
            <p className="font-serif text-xl font-bold">Press highlights are on the way.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              In the meantime, <Link to="/contact" className="text-accent underline">talk to us</Link> about your story.
            </p>
          </div>
        ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {pressCases.map((c) => (
            <Link
              key={c.slug}
              to="/work/$slug"
              params={{ slug: c.slug }}
              className="group soft-card p-10 transition-colors hover:bg-secondary"
            >
              <p className="eyebrow">{c.sector}</p>
              <p className="mt-5 font-serif font-bold text-2xl leading-snug group-hover:text-accent">
                {c.headline}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{c.client}</p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                Read the story <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <div className="border-t border-hairline bg-secondary">
        <Section>
          <SectionHeading
            eyebrow="Your story next"
            title="Have something worth the front page?"
            intro="Our media desk works with national business, technology and lifestyle editors every week."
            align="center"
          />
          <div className="mt-10 flex justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-4 text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor"
            >
              Start a Conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </div>
    </SiteLayout>
  );
}
