import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  ArrowRight,
} from "lucide-react";
import { serviceGroups, contact } from "@/content/site";

const navLinkClass =
  "text-sm font-medium text-foreground/75 transition-colors hover:text-accent";

const socialIcon: Record<string, typeof Linkedin> = {
  LinkedIn: Linkedin,
  "X (Twitter)": Twitter,
  Instagram: Instagram,
  Facebook: Facebook,
};

type DropdownItem = { to: string; label: string; description?: string };

const aboutMenu: DropdownItem[] = [
  {
    to: "/about",
    label: "Who We Are",
    description: "The story, values and team behind SYAN Media.",
  },
  {
    to: "/work",
    label: "Customer Stories",
    description: "How clients across sectors grew their authority with us.",
  },
];

const insightsMenu: DropdownItem[] = [
  {
    to: "/insights",
    label: "Blog",
    description: "Thinking on reputation, discovery and measurement.",
  },
  {
    to: "/press",
    label: "Press Coverage",
    description: "National press moments we delivered for clients.",
  },
];

function Dropdown({
  label,
  to,
  items,
  open,
  onOpen,
  onClose,
  wide,
  children,
}: {
  label: string;
  to: string;
  items?: DropdownItem[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  wide?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <Link
        to={to}
        className={`${navLinkClass} inline-flex items-center gap-1`}
        onClick={onClose}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </Link>
      {open &&
        (children ?? (
          <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-4">
            <div className="space-y-2 rounded-3xl border border-hairline bg-card p-4 shadow-[var(--shadow-editorial)]">
              {items?.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={onClose}
                  className="block rounded-2xl bg-secondary/60 p-5 transition-colors hover:bg-secondary"
                >
                  <p className="text-sm font-semibold leading-snug">{item.label}</p>
                  {item.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setOpenMenu(null);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-navy text-navy-foreground lg:block">
        <div className="mx-auto flex max-w-7xl items-stretch justify-between gap-6 px-5 lg:px-8">
          <div className="flex items-center gap-8 py-2.5 text-xs">
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:text-[color:var(--gold)]">
              <Mail className="h-3.5 w-3.5" /> {contact.email}
            </a>
            <span className="inline-flex items-center gap-2 text-navy-foreground/75">
              <MapPin className="h-3.5 w-3.5" /> {contact.location}
            </span>
          </div>
          <div className="flex items-center gap-4 bg-[color:var(--gold)] px-8 text-navy">
            {contact.socials.map((s) => {
              const Icon = socialIcon[s.label] ?? Linkedin;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="transition-opacity hover:opacity-70"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-hairline bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy">
              <span className="h-3.5 w-3.5 rounded-full bg-[color:var(--gold)]" />
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-serif text-lg font-extrabold tracking-tight">SYAN MEDIA</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Narrative Engineered
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>

            <Dropdown
              label="About Us"
              to="/about"
              items={aboutMenu}
              open={openMenu === "about"}
              onOpen={() => setOpenMenu("about")}
              onClose={close}
            />

            <Link to="/work" className={navLinkClass}>
              Works
            </Link>

            {/* How We Help Brands — service mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu("help")}
              onMouseLeave={close}
            >
              <Link
                to="/services"
                className={`${navLinkClass} inline-flex items-center gap-1`}
                onClick={close}
              >
                How We Help Brands
                <ChevronDown className="h-3.5 w-3.5" />
              </Link>
              {openMenu === "help" && (
                <div className="absolute left-1/2 top-full w-[min(72rem,90vw)] -translate-x-1/2 pt-4">
                  <div className="grid grid-cols-5 gap-4 rounded-3xl border border-hairline bg-card p-5 shadow-[var(--shadow-editorial)]">
                    {serviceGroups.map((group) => (
                      <div key={group.id} className="rounded-2xl bg-secondary/60 p-5">
                        <p className="eyebrow text-accent">{group.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {group.blurb}
                        </p>
                        <ul className="mt-4 space-y-3">
                          {group.services.map((service) => (
                            <li key={service.slug}>
                              <Link
                                to="/services/$slug"
                                params={{ slug: service.slug }}
                                onClick={close}
                                className="block text-sm font-semibold leading-snug transition-colors hover:text-accent"
                              >
                                {service.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Dropdown
              label="Insights"
              to="/insights"
              items={insightsMenu}
              open={openMenu === "insights"}
              onOpen={() => setOpenMenu("insights")}
              onClose={close}
            />

            <Link to="/careers" className={navLinkClass}>
              Careers
            </Link>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link to="/search" aria-label="Search" className="text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-accent"
            >
              Sign in
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-xs font-semibold text-navy-foreground transition-colors hover:bg-windsor"
            >
              Start a Conversation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-hairline bg-background px-5 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            <p className="eyebrow">About Us</p>
            <div className="flex flex-col gap-2 pl-3">
              <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                Who We Are
              </Link>
              <Link to="/work" onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                Customer Stories
              </Link>
            </div>

            <div className="rule-gold my-2" />
            <p className="eyebrow">How We Help Brands</p>
            {serviceGroups.map((group) => (
              <div key={group.id} className="pl-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.title}
                </p>
                <ul className="mt-2 space-y-2">
                  {group.services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to="/services/$slug"
                        params={{ slug: s.slug }}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-medium"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="rule-gold my-2" />
            <p className="eyebrow">Insights</p>
            <div className="flex flex-col gap-2 pl-3">
              <Link to="/insights" onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                Blog
              </Link>
              <Link to="/press" onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                Press Coverage
              </Link>
            </div>

            <div className="rule-gold my-2" />
            {[
              { to: "/work", label: "Works" },
              { to: "/careers", label: "Careers" },
              { to: "/team", label: "Team" },
              { to: "/intelligence", label: "SYAN Intelligence" },
              { to: "/search", label: "Search" },
              { to: "/contact", label: "Contact" },
              { to: "/auth", label: "Sign in" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-lg font-bold"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-navy px-5 py-3 text-center text-xs font-semibold text-navy-foreground"
            >
              Start a Conversation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
