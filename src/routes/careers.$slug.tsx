import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { contact } from "@/content/site";
import { getOpenCareer } from "@/lib/careers.functions";

const careerQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-career", slug],
    queryFn: () => getOpenCareer({ data: { slug } }),
  });

export const Route = createFileRoute("/careers/$slug")({
  loader: async ({ params, context }) => {
    const role = await context.queryClient.ensureQueryData(careerQuery(params.slug));
    if (!role) throw notFound();
    return { role };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Role not found — SYAN Media" }, { name: "robots", content: "noindex" }] };
    const { role } = loaderData;
    const title = `${role.title} — Careers at SYAN Media`;
    return {
      meta: [
        { title },
        { name: "description", content: role.detail },
        { property: "og:title", content: title },
        { property: "og:description", content: role.detail },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  pendingComponent: () => (
    <SiteLayout>
      <Section>
        <div className="h-64 animate-pulse rounded-2xl bg-secondary" />
      </Section>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <p className="eyebrow">Careers</p>
        <p className="mt-4 font-serif text-2xl font-bold">This role is no longer open.</p>
        <Link to="/careers" className="mt-6 inline-flex text-sm text-accent underline">
          See open roles
        </Link>
      </Section>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <Section>
        <p className="font-serif text-2xl font-bold">We couldn't load this role.</p>
        <button onClick={reset} className="mt-6 text-sm text-accent underline">
          Try again
        </button>
      </Section>
    </SiteLayout>
  ),
  component: CareerDetail,
});

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {items.map((i) => (
          <li key={i}>— {i}</li>
        ))}
      </ul>
    </div>
  );
}

function CareerDetail() {
  const { slug } = Route.useParams();
  const { data: role } = useSuspenseQuery(careerQuery(slug));
  if (!role) return null;
  const applyHref =
    role.application_url ||
    `mailto:${contact.email}?subject=${encodeURIComponent(`Application: ${role.title}`)}`;
  return (
    <SiteLayout>
      <PageHero
        eyebrow={[role.department, role.employment_type, role.location].filter(Boolean).join(" · ")}
        title={role.title}
        intro={role.detail}
      />
      <Section>
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-10 md:col-span-2">
            {role.full_description && (
              <p className="whitespace-pre-line leading-relaxed">{role.full_description}</p>
            )}
            <List title="Responsibilities" items={role.responsibilities} />
            <List title="Requirements" items={role.requirements} />
            <List title="Benefits" items={role.benefits} />
          </div>
          <aside className="soft-card h-fit space-y-4 p-8">
            {role.closing_date && (
              <p className="text-sm text-muted-foreground">
                Applications close {new Date(role.closing_date).toLocaleDateString("en-GB", { dateStyle: "long" })}
              </p>
            )}
            <a
              href={applyHref}
              target={role.application_url ? "_blank" : undefined}
              rel="noreferrer"
              className="inline-flex border border-navy px-6 py-3 rounded-full text-sm font-semibold transition-colors hover:bg-navy hover:text-navy-foreground"
            >
              Apply for this role
            </a>
            <Link to="/careers" className="block text-sm text-accent underline">
              All open roles
            </Link>
          </aside>
        </div>
      </Section>
    </SiteLayout>
  );
}
