import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { clientSectors } from "@/content/site";
import { listPublishedWorks } from "@/lib/works.functions";

export const worksQuery = queryOptions({
  queryKey: ["public-works"],
  queryFn: () => listPublishedWorks(),
});

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQuery),
  pendingComponent: () => (
    <SiteLayout>
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="soft-card h-64 animate-pulse" />
          ))}
        </div>
      </Section>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <Section>
        <p className="eyebrow">Our Work</p>
        <p className="mt-4 font-serif text-2xl font-bold">We couldn't load our case studies.</p>
        <button onClick={reset} className="mt-6 rounded-full border border-hairline px-5 py-2 text-sm">
          Try again
        </button>
      </Section>
    </SiteLayout>
  ),
  component: WorkIndex,
});

function WorkIndex() {
  const { data: works } = useSuspenseQuery(worksQuery);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our Work"
        title="Over 25 industry leaders and growing brands trust us to tell their story."
        intro="Whether launching a major product, handling sensitive public relations, or expanding across Nigeria — here is a selection of the work."
      />

      <Section>
        {works.length === 0 ? (
          <div className="soft-card p-10 text-center">
            <p className="font-serif text-xl font-bold">New case studies are on the way.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              In the meantime, <Link to="/contact" className="text-accent underline">talk to us</Link> about your brief.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {works.map((c) => (
              <Link
                key={c.slug}
                to="/work/$slug"
                params={{ slug: c.slug }}
                className="group soft-card overflow-hidden transition-colors hover:bg-secondary"
              >
                {c.coverUrl && (
                  <img src={c.coverUrl} alt={c.client} loading="lazy" className="aspect-[16/9] w-full object-cover" />
                )}
                <div className="p-10">
                  <p className="eyebrow">
                    {c.sector}
                    {c.featured && <span className="ml-2 text-accent">· Featured</span>}
                  </p>
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
                </div>
              </Link>
            ))}
          </div>
        )}
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
