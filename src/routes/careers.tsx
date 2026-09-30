import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { careers, contact } from "@/content/site";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — SYAN Media" },
      {
        name: "description",
        content:
          "Open roles at SYAN Media in media relations, search and AI visibility, intelligence analysis and video production.",
      },
      { property: "og:title", content: "Careers — SYAN Media" },
      { property: "og:description", content: "Build reputations that convert. Open roles in Lagos." },
    ],
  }),
  component: Careers,
});

function Careers() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Careers"
        title="Build reputations that convert."
        intro="We hire people who can hold a senior room, write with precision and defend a narrative under pressure."
      />
      <Section>
        <div className="space-y-px bg-hairline">
          {careers.map((role) => (
            <div
              key={role.slug}
              className="flex flex-wrap items-center justify-between gap-6 bg-card p-8"
            >
              <div className="max-w-xl">
                <p className="font-serif font-bold text-xl">{role.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.detail}</p>
                <p className="eyebrow mt-4">
                  {role.type} · {role.location}
                </p>
              </div>
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                className="border border-navy px-6 py-3 rounded-full text-sm font-semibold transition-colors hover:bg-navy hover:text-navy-foreground"
              >
                Apply
              </a>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Nothing that fits? Send a portfolio and a note to{" "}
          <a className="text-accent hover:underline" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          .
        </p>
      </Section>
    </SiteLayout>
  );
}
