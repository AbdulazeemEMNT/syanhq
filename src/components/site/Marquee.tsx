import { Asterisk } from "lucide-react";

export function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-navy py-5">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-12">
            <span className="text-lg font-semibold text-navy-foreground lg:text-xl">{item}</span>
            <Asterisk className="h-5 w-5 text-[color:var(--gold)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
