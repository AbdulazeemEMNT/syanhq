import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section, SectionHeading } from "@/components/site/Primitives";
import { bouquets, matrixRows, addOns, pricingTerms } from "@/content/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Bouquets — SYAN Media" },
      {
        name: "description",
        content:
          "Monthly media, marketing and PR bouquets from ₦100,000 — micro-business to corporate enterprise, plus web, video and ads add-ons.",
      },
      { property: "og:title", content: "Pricing & Bouquets — SYAN Media" },
      {
        property: "og:description",
        content:
          "Transparent monthly bouquets from ₦100,000, built to bring your brand real business.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Pricing"
        title="Clear bouquets. Real outcomes."
        intro="Pick a monthly bouquet that matches your ambition. Every plan is built to bring your brand real business — not vanity metrics."
      />

      <Section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {bouquets.map((b) => (
          <div
            key={b.id}
            className={`flex flex-col rounded-[1.75rem] border p-8 ${
              b.featured ? "border-accent bg-secondary/60" : "border-hairline bg-card"
            }`}
          >
            {b.featured && <p className="eyebrow text-accent">Most popular</p>}
            <h2 className="mt-2 font-serif text-xl font-bold">{b.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{b.audience}</p>
            <p className="num mt-5 text-3xl font-bold text-navy">
              {b.price}
              <span className="text-sm font-normal text-muted-foreground"> {b.cadence}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {b.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span className="text-foreground/85">{h}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor"
            >
              Start with {b.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </Section>

      {/* Full comparison matrix */}
      <div className="border-y border-hairline bg-secondary/50">
        <Section>
          <SectionHeading
            eyebrow="Full comparison"
            title="Everything, side by side."
            intro="The complete feature matrix across all five bouquets."
          />
          <div className="mt-12 overflow-x-auto rounded-[1.75rem] border border-hairline bg-card">
            <table className="w-full min-w-[56rem] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="p-5 font-serif text-base font-bold">What's included</th>
                  {bouquets.map((b) => (
                    <th key={b.id} className="p-5 font-serif text-base font-bold">
                      {b.name}
                      <p className="num mt-1 text-xs font-normal text-muted-foreground">
                        {b.price} {b.cadence}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row) => (
                  <tr key={row.feature} className="border-b border-hairline last:border-0">
                    <td className="p-5 font-semibold">{row.feature}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="p-5 text-muted-foreground">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Add-ons */}
      <Section>
        <SectionHeading
          eyebrow="One-off projects & add-ons"
          title="Beyond the monthly bouquets."
          intro="Available with any bouquet, or as standalone projects."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {addOns.map((a) => (
            <div key={a.name} className="soft-card p-7">
              <p className="font-serif text-lg font-bold">{a.name}</p>
              <p className="num mt-2 text-xl font-bold text-navy">{a.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.scope}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[1.75rem] border border-hairline bg-secondary/50 p-8">
          <p className="font-serif text-lg font-bold">Good to know</p>
          <ul className="mt-4 grid gap-5 text-sm text-muted-foreground md:grid-cols-3">
            {pricingTerms.map((t) => (
              <li key={t.title}>
                <p className="font-semibold text-foreground">{t.title}</p>
                <p className="mt-1">{t.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-4 text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor"
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </SiteLayout>
  );
}
