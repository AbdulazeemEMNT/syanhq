import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { contact } from "@/content/site";
import { listOpenCareers } from "@/lib/careers.functions";

export const careersQuery = queryOptions({
  queryKey: ["public-careers"],
  queryFn: () => listOpenCareers(),
});

export const Route = createFileRoute("/careers/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery),
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: () => (
    <SiteLayout>
      <Section>
        <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
      </Section>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <Section>
        <p className="font-serif text-2xl font-bold">We couldn't load open roles.</p>
        <button onClick={reset} className="mt-6 text-sm text-accent underline">
          Try again
        </button>
      </Section>
    </SiteLayout>
  ),
  component: Careers,
});

function Careers() {
  const { data: roles } = useSuspenseQuery(careersQuery);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Careers"
        title="Build reputations that convert."
        intro="We hire people who can hold a senior room, write with precision and defend a narrative under pressure."
      />
      <Section>
        {roles.length === 0 ? (
          <p className="text-muted-foreground">There are no open roles right now.</p>
        ) : (
          <div className="space-y-px bg-hairline">
            {roles.map((role) => (
              <div
                key={role.slug}
                className="flex flex-wrap items-center justify-between gap-6 bg-card p-8"
              >
                <div className="max-w-xl">
                  <Link
                    to="/careers/$slug"
                    params={{ slug: role.slug }}
                    className="font-serif font-bold text-xl hover:text-accent"
                  >
                    {role.title}
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.detail}</p>
                  <p className="eyebrow mt-4">
                    {[role.department, role.employment_type, role.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Link
                  to="/careers/$slug"
                  params={{ slug: role.slug }}
                  className="border border-navy px-6 py-3 rounded-full text-sm font-semibold transition-colors hover:bg-navy hover:text-navy-foreground"
                >
                  View role
                </Link>
              </div>
            ))}
          </div>
        )}
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
