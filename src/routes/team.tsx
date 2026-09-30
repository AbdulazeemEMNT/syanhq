import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { team } from "@/content/site";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — SYAN Media" },
      {
        name: "description",
        content:
          "The specialist units behind SYAN Media: media relations, search authority, creative studio, intelligence and client growth.",
      },
      { property: "og:title", content: "Team — SYAN Media" },
      {
        property: "og:description",
        content: "Specialist units, one accountable team.",
      },
    ],
  }),
  component: Team,
});

function Team() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Team"
        title="Specialist units, one accountable team."
        intro="Senior people on every account — no junior hand-offs, no anonymous execution."
      />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="soft-card p-9">
              <div className="flex h-14 w-14 items-center justify-center border border-hairline">
                <span className="num text-sm text-accent">{m.initials}</span>
              </div>
              <p className="mt-6 font-serif font-bold text-xl">{m.name}</p>
              <p className="mt-1 text-sm text-accent">{m.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.focus}</p>
            </div>
          ))}
        </div>
      </Section>
      <div className="border-y border-hairline bg-secondary">
        <Section className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow">Careers</p>
            <p className="mt-3 font-serif font-bold text-2xl">We are hiring across the desk.</p>
          </div>
          <Link
            to="/careers"
            className="bg-navy px-6 py-3 rounded-full text-sm font-semibold text-navy-foreground hover:bg-windsor"
          >
            See open roles
          </Link>
        </Section>
      </div>
    </SiteLayout>
  );
}
