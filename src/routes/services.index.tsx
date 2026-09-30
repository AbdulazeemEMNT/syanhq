import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { serviceGroups } from "@/content/site";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "What We Do — SYAN Media Services" },
      {
        name: "description",
        content:
          "Public relations, Google and AI search ranking, digital marketing, creative studio and media intelligence from SYAN Media.",
      },
      { property: "og:title", content: "What We Do — SYAN Media Services" },
      {
        property: "og:description",
        content:
          "Four disciplines and an intelligence layer, organised into one authority system.",
      },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="What We Do"
        title="Four disciplines. One authority system."
        intro="We organise our services into strategic groups so you can buy an outcome, not a task list."
      />
      <Section className="space-y-16">
        {serviceGroups.map((group) => (
          <div key={group.id} className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <div>
              <p className="eyebrow">{group.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{group.blurb}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.services.map((s) => (
                <Link
                  key={s.slug}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group soft-card p-8 transition-colors hover:bg-secondary"
                >
                  <p className="font-serif font-bold text-xl leading-snug group-hover:text-accent">{s.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                  <ul className="mt-5 space-y-2">
                    {s.capabilities.slice(0, 3).map((c) => (
                      <li key={c.title} className="text-sm text-foreground/80">
                        · {c.title}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                    View service <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </SiteLayout>
  );
}
