import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/contact.functions";
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

const emptyForm = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  enquiry_type: services[0]?.name ?? "",
  message: "",
  website: "",
};
type FormKey = keyof typeof emptyForm;

function validate(f: typeof emptyForm) {
  const e: Partial<Record<FormKey, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email";
  if (f.phone && !/^[+\d\s()-]{6,40}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number";
  if (f.message.trim().length < 10) e.message = "Tell us a little more (10+ characters)";
  return e;
}

function Contact() {
  const submit = useServerFn(submitContactMessage);
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [form, setForm] = useState(emptyForm);
  const inputCls =
    "w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm outline-none focus:border-accent";
  const err = (k: FormKey) =>
    errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null;

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
          {status === "sent" ? (
            <div className="mt-8 soft-card p-10">
              <p className="font-serif text-2xl font-bold">Thank you — your message is with us.</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A member of the SYAN team will reply to {form.email} shortly, usually within one
                working day.
              </p>
              <button
                onClick={() => {
                  setForm(emptyForm);
                  setStatus("idle");
                }}
                className="mt-6 text-sm text-accent underline"
              >
                Send another message
              </button>
            </div>
          ) : (
          <form
            noValidate
            className="mt-8 space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const v = validate(form);
              setErrors(v);
              setServerError(null);
              if (Object.keys(v).length) return;
              setStatus("sending");
              try {
                await submit({ data: { ...form, elapsedMs: Date.now() - startedAt } });
                setStatus("sent");
              } catch (ex) {
                setServerError(
                  ex instanceof Error && ex.message.length < 200
                    ? ex.message
                    : "We couldn't send your message. Please try again.",
                );
                setStatus("idle");
              }
            }}
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="hidden"
            />
            <Field label="Full name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              {err("name")}
            </Field>
            <Field label="Organisation">
              <input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              {err("email")}
            </Field>
            <Field label="Phone (optional)">
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              {err("phone")}
            </Field>
            <Field label="What do you need?">
              <select
                value={form.enquiry_type}
                onChange={(e) => setForm({ ...form, enquiry_type: e.target.value })}
                className={inputCls}
              >
                {services.map((s) => (
                  <option key={s.slug} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="SYAN Intelligence">SYAN Intelligence</option>
                <option value="Careers">Careers</option>
                <option value="Something else">Something else</option>
              </select>
            </Field>
            <Field label="Brief">
              <textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
              {err("message")}
            </Field>
            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-navy px-7 py-4 rounded-full text-sm font-semibold text-navy-foreground transition-colors hover:bg-windsor disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Start a Conversation"}
            </button>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          </form>
          )}
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
