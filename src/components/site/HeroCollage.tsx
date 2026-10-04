import { useEffect, useState } from "react";

type Img = { src: string; alt: string };

/** Three fixed slots; every few seconds images rotate between slots with staggered cross-fades. */
export function HeroCollage({ images }: { images: [Img, Img, Img] }) {
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setShift((s) => (s + 1) % 3), 7000);
    return () => window.clearInterval(id);
  }, []);

  const slot = (slotIndex: number, delay: number, cls: string) => (
    <div className={`hero-tile ${cls}`} style={{ animationDelay: `${delay}ms` }}>
      {images.map((img, i) => (
        <div
          key={img.src}
          className="hero-frame"
          data-active={(i + 3 - shift) % 3 === slotIndex}
          style={{ transitionDelay: `${slotIndex * 220}ms` }}
          aria-hidden={(i + 3 - shift) % 3 !== slotIndex}
        >
          <img
            src={img.src}
            alt={img.alt}
            className="hero-drift"
            style={{ animationDelay: `${-i * 5}s` }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="hero-grid grid h-[340px] min-h-0 grid-cols-2 gap-4 lg:h-[470px]">
      {slot(0, 100, "h-full")}
      <div className="grid min-h-0 grid-rows-2 gap-4">
        {slot(1, 280, "")}
        {slot(2, 460, "")}
      </div>
    </div>
  );
}
