import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section, SectionHeading } from "@/components/site/Primitives";
import { process, clientSectors, team } from "@/content/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SYAN Media — Narrative Engineered, Authority Institutionalised" },
      {
        name: "description",
        content:
          "SYAN Media connects powerful storytelling with real commercial results for banks, technology firms, corporates and public institutions.",
      },
      { property: "og:title", content: "About SYAN Media" },
      {
        property: "og:description",
        content:
          "We don't just get you attention. We help you grow — PR, search authority, growth and creative from Lagos.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About"
        title="We Don't Just Get You Attention. We Help You Grow."
        intro="Too many PR agencies focus on vanity mentions that never bring in a single customer or investor. We do things differently."
      />

      <Section className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeading eyebrow="Our position" title="Storytelling with commercial consequence." />
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            At SYAN Media, we connect powerful storytelling with real commercial results. We make
            sure your brand is seen on front-page news, trusted by your target audience, and chosen
            whenever people search for your services.
          </p>
          <p>
            No confusing jargon — just clear strategies that build your reputation and grow your
            business. Our work spans banking and fintech, technology and cloud, energy and motors,
            retail, faith-based organisations, government and education.
          </p>
          <p>
            Everything we build sits on one promise:{" "}
            <span className="text-foreground">Narrative Engineered. Authority Institutionalised.</span>
          </p>
        </div>
      </Section>

      <div className="border-y border-hairline bg-secondary">
        <Section>
          <SectionHeading eyebrow="Why businesses choose SYAN" title="Four reasons clients stay." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Results That Matter",
                d: "We focus on real business growth, customer trust, and sales — not vanity numbers.",
              },
              {
                t: "Direct Access to Top Editors",
                d: "We get your news published fast because we deal directly with senior journalists.",
              },
              {
                t: "Ahead of the Curve",
                d: "We prepare your business for modern AI search so you never fall behind.",
              },
              {
                t: "Fast & Dependable",
                d: "Quick turnarounds with flawless attention to detail.",
              },
            ].map((i) => (
              <div key={i.t} className="soft-card p-8">
                <p className="font-serif font-bold text-lg">{i.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading eyebrow="How we work" title="Discover. Launch. Refine." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {process.map((p) => (
            <div key={p.step} className="soft-card p-8">
              <p className="eyebrow text-accent">{p.step}</p>
              <p className="mt-4 font-serif font-bold text-xl">{p.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.what}</p>
              <div className="rule-gold my-6" />
              <p className="text-sm leading-relaxed">{p.get}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="border-y border-hairline bg-secondary">
        <Section>
          <SectionHeading eyebrow="Clients" title="Sectors we operate in." />
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {clientSectors.map((s) => (
              <div key={s.sector}>
                <p className="eyebrow">{s.sector}</p>
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

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="The desk" title="Specialist units, one accountable team." />
          <Link
            to="/team"
            className="rounded-full text-sm font-semibold text-accent hover:underline"
          >
            Meet the team →
          </Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.slice(0, 3).map((m) => (
            <div key={m.name} className="soft-card p-8">
              <span className="num text-xs text-accent">{m.initials}</span>
              <p className="mt-4 font-serif font-bold text-lg">{m.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
