import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/Primitives";
import { contact, services } from "@/content/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SYAN Media — Start a Conversation" },
      {
        name: "description",
        content:
          "Talk to the SYAN Media team about press coverage, search authority, campaigns or media intelligence. Lagos, Nigeria.",
      },
      { property: "og:title", content: "Contact SYAN Media" },
      {
        property: "og:description",
        content: "Let's put your business in front of the right people.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    organisation: "",
    email: "",
    interest: services[0]?.name ?? "",
    message: "",
  });

  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(
    `New enquiry — ${form.organisation || form.name || "SYAN website"}`,
  )}&body=${encodeURIComponent(
    `Name: ${form.name}\nOrganisation: ${form.organisation}\nEmail: ${form.email}\nInterest: ${form.interest}\n\n${form.message}`,
  )}`;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Let's Put Your Business in Front of the Right People."
        intro="Whether you are launching a product, expanding to new locations, or looking to build undeniable market trust, we are here to make it happen."
      />

      <Section className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Enquiry</p>
          <form
            className="mt-8 space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setSent(true);
              try {
                await supabase.from("contact_messages").insert({
                  name: form.name,
                  organisation: form.organisation || null,
                  email: form.email,
                  interest: form.interest || null,
                  message: form.message,
                });
              } catch {
                // the mailto handoff below still fires even if saving fails
              }
              window.location.href = mailto;
            }}
          >
            <Field label="Full name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </Field>
            <Field label="Organisation">
              <input
                value={form.organisation}
                onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </Field>
            <Field label="What do you need?">
              <select
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm outline-none focus:border-accent"
              >
                {services.map((s) => (
                  <option key={s.slug} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="SYAN Intelligence">SYAN Intelligence</option>
                <option value="Something else">Something else</option>
              </select>
            </Field>
            <Field label="Brief">
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </Field>
            <button
              type="submit"
              className="bg-navy px-7 py-4 rounded-full text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor"
            >
              Start a Conversation
            </button>
            {sent && (
              <p className="text-sm text-muted-foreground">
                Your email client should now open with the enquiry ready to send. If it doesn&apos;t,
                write to{" "}
                <a className="text-accent hover:underline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                .
              </p>
            )}
          </form>
        </div>

        <aside className="space-y-8">
          <div className="rounded-2xl border border-hairline p-7">
            <p className="eyebrow">Reach us directly</p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-4 block font-serif font-bold text-xl hover:text-accent"
            >
              {contact.email}
            </a>
            <p className="mt-2 text-sm text-muted-foreground">{contact.location}</p>
          </div>
          <div className="rounded-2xl border border-hairline p-7">
            <p className="eyebrow">Follow</p>
            <ul className="mt-4 space-y-3 text-sm">
              {contact.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted-foreground hover:text-accent"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="obsidian p-7">
            <p className="font-serif font-bold text-lg text-navy-foreground">Crisis situation?</p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Mark your subject line “URGENT — CRISIS” and our senior desk will respond first.
            </p>
          </div>
        </aside>
      </Section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
