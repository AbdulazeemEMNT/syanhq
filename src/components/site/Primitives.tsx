import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <span className="eyebrow">
      <span
        className={`inline-block h-2.5 w-6 rounded-full ${
          tone === "light" ? "bg-[color:var(--gold)]" : "bg-accent"
        }`}
      />
      <span className={tone === "light" ? "text-[color:var(--gold)]" : ""}>{children}</span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="display-lg mt-4">{title}</h2>
      {intro && <p className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-background px-5 pt-6 lg:px-8">
      <div className="obsidian mx-auto max-w-7xl rounded-[2.5rem] px-8 py-20 lg:px-14 lg:py-24">
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h1 className="display-xl mt-6 max-w-4xl text-navy-foreground">{title}</h1>
        {intro && <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65">{intro}</p>}
        {children}
      </div>
    </div>
  );
}

export function GoldLink({
  to,
  params,
  children,
}: {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
