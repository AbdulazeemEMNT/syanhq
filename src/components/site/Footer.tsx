import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { contact, services } from "@/content/site";
import syanMark from "@/assets/syan-logo-mark.png";

const explore = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/work", label: "Our Work" },
  { to: "/insights", label: "Insights" },
  { to: "/team", label: "Team" },
  { to: "/contact", label: "Contact" },
];

const intelligence = [
  { hash: "", label: "SYAN Intelligence" },
  { hash: "media-listening", label: "Media Intelligence" },
  { hash: "reputation-alerts", label: "Reputation Intelligence" },
  { hash: "ai-visibility", label: "AI Visibility" },
  { hash: "narrative-intelligence", label: "Market Intelligence" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-background pb-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="obsidian overflow-hidden rounded-[2.5rem]">
          <div className="border-b border-white/10 px-8 py-16 lg:px-14 lg:py-20">
            <p className="eyebrow text-[color:var(--gold)]">Start here</p>
            <h2 className="display-lg mt-6 max-w-3xl text-navy-foreground">
              Have a story that matters?
              <br />
              Let&apos;s make sure the right people hear it.
            </h2>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[color:var(--gold)] px-7 py-4 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
            >
              Start a Conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-12 px-8 py-16 md:grid-cols-2 lg:grid-cols-5 lg:px-14">
            <div>
              <p className="flex items-center gap-2.5">
                <img src={syanMark} alt="" className="h-7 w-7" />
                <span className="font-logo text-xl font-semibold text-navy-foreground">syanmedia</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Narrative Engineered.
                <br />
                Authority Institutionalised.
              </p>
            </div>

            <FooterCol title="Explore">
              {explore.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-[color:var(--gold)]">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/pricing" className="text-sm text-white/60 hover:text-[color:var(--gold)]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-white/60 hover:text-[color:var(--gold)]">
                  Careers
                </Link>
              </li>
            </FooterCol>

            <FooterCol title="What We Do">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="text-sm text-white/60 hover:text-[color:var(--gold)]"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </FooterCol>

            <FooterCol title="Intelligence">
              {intelligence.map((l) =>
                l.hash ? (
                  <li key={l.label}>
                    <Link
                      to="/intelligence"
                      hash={l.hash}
                      className="text-sm text-white/60 hover:text-[color:var(--gold)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link
                      to="/intelligence"
                      className="text-sm text-white/60 hover:text-[color:var(--gold)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ),
              )}
              <li>
                <Link
                  to="/intelligence"
                  className="text-sm text-white/60 hover:text-[color:var(--gold)]"
                >
                  Intelligence Dashboard
                </Link>
              </li>
            </FooterCol>

            <div className="space-y-8">
              <FooterCol title="Connect">
                {contact.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-white/60 hover:text-[color:var(--gold)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </FooterCol>
              <FooterCol title="Contact">
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-white/60 hover:text-[color:var(--gold)]"
                  >
                    {contact.email}
                  </a>
                </li>
                <li className="text-sm text-white/60">{contact.location}</li>
              </FooterCol>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 px-8 py-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-14">
            <p>© {new Date().getFullYear()} SYAN Media. All rights reserved.</p>
            <div className="flex flex-wrap gap-6">
              <Link to="/privacy" className="hover:text-[color:var(--gold)]">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-[color:var(--gold)]">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-[color:var(--gold)]">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-white/40">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}
