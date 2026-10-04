import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section, SectionHeading, GoldLink, Eyebrow } from "@/components/site/Primitives";
import { Marquee } from "@/components/site/Marquee";
import { serviceGroups, process, clientSectors } from "@/content/site";
import { articlesQuery } from "@/lib/articles.functions";
import { worksQuery } from "@/routes/work.index";
import { bouquets } from "@/content/pricing";
import teamCollab from "@/assets/team-collab.jpg";
import strategyRoom from "@/assets/strategy-room.jpg";
import pressInterview from "@/assets/press-interview.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SYAN Media — We Make Your Brand Impossible to Ignore" },
      {
        name: "description",
        content:
          "SYAN Media gets your brand featured in top national newspapers, ranked on Google and AI search, and positioned in front of paying customers.",
      },
      { property: "og:title", content: "SYAN Media — We Make Your Brand Impossible to Ignore" },
      {
        property: "og:description",
        content:
          "PR, search authority, growth marketing and creative for organisations that cannot afford to lose control of their narrative.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(worksQuery),
      context.queryClient.ensureQueryData(articlesQuery),
    ]),
  component: Index,
});

const proof = [
  {
    title: "25+ Leading Brands Trusted Us",
    detail: "From commercial banks and tech firms to retail household favourites.",
  },
  {
    title: "Top National Media Access",
    detail: "Direct editorial connections with Nigeria's most respected business editors.",
  },
  {
    title: "Built for Sales, Not Just Clout",
    detail: "Every press release, digital campaign, and ad is built to bring you real business.",
  },
  {
    title: "Google & AI Search Ready",
    detail: "We ensure your business shows up first when customers search online.",
  },
];

const capability = [
  { label: "Earned Media & Publicity", value: 92 },
  { label: "Search & AI Discovery", value: 88 },
  { label: "Growth & Demand Generation", value: 85 },
];

const stats = [
  { value: "25+", label: "Brands Advised" },
  { value: "300+", label: "Media Placements" },
  { value: "5", label: "Practice Areas" },
  { value: "10+", label: "Years Combined" },
];

function Index() {
  const { data: works } = useSuspenseQuery(worksQuery);
  const { data: insights } = useSuspenseQuery(articlesQuery);
  return (
    <SiteLayout>
      {/* Hero */}
      <div className="bg-secondary/50">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <Eyebrow>Elevate Your Brand With Us</Eyebrow>
            <h1 className="display-xl mt-6">We Make Your Brand Impossible to Ignore.</h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
              Great businesses fail in the dark. We get your brand featured in top national
              newspapers, ranked on Google and AI search, and positioned directly in front of paying
              customers.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor"
              >
                Work With Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="text-sm font-semibold underline underline-offset-4 hover:text-accent"
              >
                View All Services
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src={teamCollab}
              alt="SYAN Media strategists collaborating in the studio"
              width={1024}
              height={1280}
              className="col-span-1 h-full w-full rounded-[2rem] object-cover grayscale"
            />
            <div className="grid gap-4">
              <img
                src={pressInterview}
                alt="Client spokesperson addressing the press"
                width={1024}
                height={1024}
                loading="lazy"
                className="h-full w-full rounded-[2rem] object-cover grayscale"
              />
              <img
                src={strategyRoom}
                alt="Media coverage review session"
                width={1280}
                height={860}
                loading="lazy"
                className="h-full w-full rounded-[2rem] object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>

      <Marquee
        items={[
          "Media Relations",
          "Search Authority",
          "Growth Marketing",
          "Creative Studio",
          "SYAN Intelligence",
        ]}
      />

      {/* Proof */}
      <Section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {proof.map((p) => (
          <div key={p.title} className="soft-card p-7">
            <p className="font-serif text-base font-bold leading-snug">{p.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
          </div>
        ))}
      </Section>

      {/* About */}
      <div className="border-y border-hairline bg-secondary/50">
        <Section>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>About Us</Eyebrow>
            <h2 className="display-lg mt-4">
              We Don&apos;t Just Get You Attention. We Help You Grow.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <div className="grid gap-5">
              <img
                src={strategyRoom}
                alt="SYAN Media team reviewing a campaign"
                width={1280}
                height={860}
                loading="lazy"
                className="w-full rounded-[2rem] object-cover grayscale"
              />
              <img
                src={teamCollab}
                alt="SYAN Media consultants at work"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-64 w-full rounded-[2rem] object-cover grayscale"
              />
            </div>
            <div>
              <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
                <p>
                  Too many PR agencies focus on vanity mentions that never bring in a single
                  customer or investor. We do things differently.
                </p>
                <p>
                  At SYAN Media, we connect powerful storytelling with real commercial results. We
                  make sure your brand is seen on front-page news, trusted by your target audience,
                  and chosen whenever people search for your services.
                </p>
              </div>

              <div className="mt-9 space-y-6">
                {capability.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{c.label}</span>
                      <span className="num text-muted-foreground">{c.value}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-hairline">
                      <div
                        className="h-1.5 rounded-full bg-navy"
                        style={{ width: `${c.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <GoldLink to="/about">More about the agency</GoldLink>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-8 rounded-[2rem] border border-hairline bg-card p-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="display-lg text-navy">{s.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Services */}
      <div className="bg-background px-5 py-10 lg:px-8">
        <div className="obsidian mx-auto max-w-7xl rounded-[2.5rem] px-8 py-16 lg:px-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow tone="light">Our Services</Eyebrow>
              <h2 className="display-lg mt-4 text-navy-foreground">
                Boost Your Brand with Our Expertise
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-navy"
            >
              View All Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 space-y-10">
            {serviceGroups.map((group) => (
              <div key={group.id}>
                <div className="flex flex-wrap items-baseline gap-4">
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--gold)]">
                    {group.title}
                  </p>
                  <p className="text-sm text-white/55">{group.blurb}</p>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {group.services.map((s) => (
                    <Link
                      key={s.slug}
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="group rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-7 transition-colors hover:bg-[color:var(--gold)]"
                    >
                      <p className="font-serif text-lg font-bold leading-snug text-navy-foreground group-hover:text-navy">
                        {s.name}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-white/55 group-hover:text-navy/75">
                        {s.summary}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--gold)] group-hover:text-navy">
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ecosystem */}
      <Section>
        <SectionHeading
          eyebrow="The SYAN Ecosystem"
          title="Listen → Understand → Strategise → Influence → Measure"
          intro="Our public practice shapes influence. SYAN Intelligence measures and explains it. Together they form one closed loop around your reputation."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {[
            { k: "Listen", v: "Monitoring across connected media and digital sources." },
            { k: "Understand", v: "Sentiment, narrative and risk analysis on what we hear." },
            { k: "Strategise", v: "Positioning, messaging and campaign architecture." },
            { k: "Influence", v: "Press, search, AI discovery and performance campaigns." },
            { k: "Measure", v: "Share of voice, reach, sentiment and AI visibility." },
          ].map((s, i) => (
            <div key={s.k} className="soft-card p-7">
              <span className="num text-xs font-bold text-accent">0{i + 1}</span>
              <p className="mt-3 font-serif text-lg font-bold">{s.k}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Work */}
      <div className="border-y border-hairline bg-secondary/50">
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Our Work"
              title="Over 25 industry leaders trust us to tell their story."
            />
            <GoldLink to="/work">All case studies</GoldLink>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {works.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                to="/work/$slug"
                params={{ slug: c.slug }}
                className="group soft-card p-8 transition-colors hover:border-accent"
              >
                <p className="eyebrow">{c.sector}</p>
                <p className="mt-4 font-serif text-xl font-bold leading-snug group-hover:text-accent">
                  {c.client}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.headline}</p>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      {/* Intelligence teaser */}
      <div className="bg-background px-5 py-10 lg:px-8">
        <div className="obsidian mx-auto max-w-7xl rounded-[2.5rem] px-8 py-16 lg:px-14 lg:py-20">
          <Eyebrow tone="light">SYAN Intelligence™</Eyebrow>
          <h2 className="display-lg mt-6 max-w-3xl text-navy-foreground">
            Monitor what the world is saying. Understand what it means. Know what to do next.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60">
            Strategic intelligence for organisations that cannot afford to lose control of their
            narrative — media listening, sentiment, narrative tracking, reputation alerts and AI
            visibility in one platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/intelligence"
              className="inline-flex items-center gap-3 rounded-full bg-[color:var(--gold)] px-7 py-4 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
            >
              Explore SYAN Intelligence <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/intelligence/dashboard"
              className="inline-flex items-center gap-3 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-white/80 hover:border-white/60"
            >
              View the dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing teaser */}
      <div className="border-y border-hairline bg-secondary/50">
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Pricing"
              title="Bouquets that match your ambition."
              intro="Monthly media, marketing and PR bouquets from ₦100,000 — built to bring your brand real business."
            />
            <GoldLink to="/pricing">Full pricing &amp; comparison</GoldLink>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {bouquets.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className={`flex flex-col rounded-[1.75rem] border p-8 ${
                  b.featured ? "border-accent bg-card" : "border-hairline bg-card"
                }`}
              >
                {b.featured && <p className="eyebrow text-accent">Most popular</p>}
                <p className="mt-2 font-serif text-xl font-bold">{b.name}</p>
                <p className="num mt-3 text-3xl font-bold text-navy">
                  {b.price}
                  <span className="text-sm font-normal text-muted-foreground"> {b.cadence}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                  {b.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-accent">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/pricing"
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor"
                >
                  See details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Process */}
      <Section>
        <SectionHeading eyebrow="How We Work" title="A simple three-step process." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {process.map((p) => (
            <div key={p.step} className="soft-card p-8">
              <p className="eyebrow text-accent">{p.step}</p>
              <p className="mt-4 font-serif text-xl font-bold">{p.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.what}</p>
              <div className="rule-gold my-6" />
              <p className="text-sm leading-relaxed">{p.get}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Clients */}
      <div className="border-y border-hairline bg-secondary/50">
        <Section>
          <SectionHeading eyebrow="Brands We Have Helped Grow" title="Trusted across sectors." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clientSectors.map((s) => (
              <div key={s.sector} className="soft-card p-7">
                <p className="eyebrow">{s.sector}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {s.clients.map((c) => (
                    <li key={c} className="border-b border-hairline pb-2 last:border-0">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Insights */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Insights" title="Thinking from the desk." />
          <GoldLink to="/insights">All insights</GoldLink>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {insights.slice(0, 3).map((i) => (
            <Link
              key={i.slug}
              to="/insights/$slug"
              params={{ slug: i.slug }}
              className="group soft-card p-8 transition-colors hover:border-accent"
            >
              <p className="eyebrow">{i.category}</p>
              <p className="mt-4 font-serif text-xl font-bold leading-snug group-hover:text-accent">
                {i.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.excerpt}</p>
              <p className="num mt-6 text-[11px] text-muted-foreground">{i.readingTime}</p>
            </Link>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
