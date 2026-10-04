import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Primitives";
import {
  capabilities,
  alertAnatomy,
  aiPlatforms,
  assistantPrompts,
  architecture,
  roadmap,
} from "@/content/intelligence";

export const Route = createFileRoute("/intelligence/")({
  head: () => ({
    meta: [
      { title: "SYAN Intelligence™ — Know what to do next" },
      {
        name: "description",
        content:
          "Know what people are saying. Understand what it means. Know what to do next. SYAN Intelligence turns media and digital conversations into strategic intelligence: media listening, sentiment, narrative, reputation and competitor intelligence with AI-assisted analysis.",
      },
      { property: "og:title", content: "SYAN Intelligence™" },
      {
        property: "og:description",
        content:
          "Know what people are saying. Understand what it means. Know what to do next.",
      },
    ],
  }),
  component: IntelligenceLanding,
});

const pillars = [
  {
    label: "Listen",
    text: "One normalised stream across every licensed media, web and social source.",
  },
  {
    label: "Understand",
    text: "Sentiment, narrative and reputation context — not just counts.",
  },
  {
    label: "Act",
    text: "Alerts and summaries that recommend the next communications move.",
  },
];

function IntelligenceLanding() {
  return (
    <SiteLayout>
      {/* Hero */}
      <div className="obsidian border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <p className="eyebrow text-[color:var(--gold)]">SYAN Intelligence™</p>
          <h1 className="display-xl mt-7 max-w-5xl text-navy-foreground">
            Know what people are saying. Understand what it means.{" "}
            <span className="text-[color:var(--gold)]">Know what to do next.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">
            SYAN Intelligence transforms media and digital conversations into strategic
            intelligence, helping organisations understand reputation, identify emerging
            narratives, monitor competitors and make faster communications decisions.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-[color:var(--gold)] px-7 py-4 rounded-full text-sm font-semibold text-navy hover:opacity-90"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/intelligence"
              hash="how-it-works"
              className="inline-flex items-center gap-3 border border-white/25 px-7 py-4 rounded-full text-sm font-semibold text-navy-foreground hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Already have access?{" "}
            <Link to="/intelligence/sign-in" className="underline underline-offset-4 hover:text-[color:var(--gold)]">
              Sign in
            </Link>
          </p>

          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.label} className="bg-[color:var(--navy)] p-8">
                <span className="num text-xs text-[color:var(--gold)]">0{i + 1}</span>
                <p className="mt-4 font-serif font-bold text-2xl leading-snug text-navy-foreground">
                  {p.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positioning */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">Positioning</p>
            <h2 className="display-lg mt-4">Not another AI chatbot.</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              SYAN Intelligence is strategic intelligence for organisations that cannot afford to
              lose control of their narrative. It is built for communications directors, executives
              and boards who need to know what is happening, what it means, and what to do — in that
              order.
            </p>
            <p>
              It is the measurement half of the SYAN promise:{" "}
              <span className="text-foreground">Narrative Engineered. Authority Institutionalised.</span>{" "}
              Our agency practice helps you shape influence. Intelligence measures and explains it.
            </p>
          </div>
        </div>
      </Section>

      {/* Capabilities */}
      <div className="border-y border-hairline bg-secondary">
        <Section>
          <p className="eyebrow">Capabilities</p>
          <h2 className="display-lg mt-4 max-w-2xl">Six core capabilities.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Nothing on this page is a sample figure. Every number inside SYAN Intelligence comes
            from a licensed data source connected to your project — until then, surfaces stay
            honest and empty.
          </p>
          <div className="mt-14 space-y-px bg-hairline">
            {capabilities.map((c) => (
              <div key={c.id} id={c.id} className="grid gap-8 bg-card p-9 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="num text-xs text-accent">{c.number}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        c.inBuild
                          ? "bg-[color:var(--accent)]/15 text-[color:var(--accent-foreground)]"
                          : "border border-hairline text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-3 font-serif font-bold text-2xl">{c.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.promise}</p>
                </div>
                <div>
                  <p className="text-base leading-relaxed text-muted-foreground">{c.detail}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {c.points.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Anatomy of an alert */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Anatomy of an alert</p>
            <h2 className="display-lg mt-4">Every anomaly arrives explained.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              A spike on its own is noise. SYAN alerts are structured so a communications lead can
              act inside the first hour.
            </p>
          </div>
          <div className="space-y-px bg-hairline">
            {alertAnatomy.map((a, i) => (
              <div key={a.label} className="soft-card p-7">
                <div className="flex gap-5">
                  <span className="num text-xs text-accent">0{i + 1}</span>
                  <div>
                    <p className="eyebrow">{a.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* AI-assisted analysis */}
      <div className="obsidian">
        <Section className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-[color:var(--gold)]">AI-assisted analysis</p>
            <h2 className="display-lg mt-4 text-navy-foreground">Ask the data a real question.</h2>
            <p className="mt-5 text-base leading-relaxed text-white/60">
              The SYAN Intelligence Assistant answers using your project data only. Where a project
              has insufficient data, it says so plainly instead of inventing analytics.
            </p>
          </div>
          <ul className="space-y-3">
            {assistantPrompts.map((p) => (
              <li
                key={p}
                className="border border-white/12 px-5 py-4 text-sm text-white/75"
              >
                “{p}”
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* AI Visibility */}
      <Section>
        <p className="eyebrow">AI Visibility</p>
        <h2 className="display-lg mt-4 max-w-3xl">
          How does your organisation appear across AI discovery?
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Discovery is shifting from search results to synthesised answers. AI Visibility tracks
          where supported platforms mention, cite or omit you — and how that compares to your
          competitive set.
        </p>
        <div className="mt-6">
          <span className="rounded-full border border-hairline px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Phase 3 · Planned
          </span>
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {aiPlatforms.map((p) => (
            <span key={p} className="rounded-full border border-hairline px-4 py-2 text-xs text-muted-foreground">
              {p}
            </span>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <div className="border-y border-hairline bg-secondary">
        <Section id="how-it-works" className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="display-lg mt-4">Provider-based by design.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              We do not pretend that external platforms can be scraped freely. Each layer is a clean
              interface, so licensed providers can be connected — or swapped — without rebuilding
              the product. Until a provider is connected for your project, the dashboard shows
              honest empty states rather than sample numbers.
            </p>
          </div>
          <ol className="space-y-px bg-hairline">
            {architecture.map((a, i) => (
              <li key={a.layer} className="flex items-center gap-5 bg-card px-7 py-5">
                <span className="num text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-serif font-bold text-lg">{a.layer}</p>
                  <p className="text-sm text-muted-foreground">{a.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* Roadmap */}
      <Section>
        <p className="eyebrow">Roadmap</p>
        <h2 className="display-lg mt-4 max-w-2xl">Built to evolve in four phases.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((p) => (
            <div key={p.phase} className="soft-card p-8">
              <p className="eyebrow text-accent">{p.phase}</p>
              <p className="mt-3 font-serif font-bold text-xl">{p.status}</p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {p.items.map((i) => (
                  <li key={i} className="border-b border-hairline pb-2">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      <div className="obsidian">
        <Section className="text-center">
          <p className="eyebrow justify-center text-[color:var(--gold)]">SYAN Intelligence™</p>
          <h2 className="display-lg mx-auto mt-4 max-w-3xl text-navy-foreground">
            Know what to do next.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
            Start the conversation about connecting licensed data sources to your project.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-[color:var(--gold)] px-7 py-4 rounded-full text-sm font-semibold text-navy hover:opacity-90"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/intelligence"
              hash="how-it-works"
              className="inline-flex items-center gap-3 border border-white/25 px-7 py-4 rounded-full text-sm font-semibold text-navy-foreground hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
            >
              See how it works
            </Link>
          </div>
        </Section>
      </div>
    </SiteLayout>
  );
}
