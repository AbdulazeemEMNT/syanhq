export function LegalBody({
  sections,
}: {
  sections: { title: string; paragraphs: string[] }[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <div className="space-y-12">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-serif font-bold text-2xl">{s.title}</h2>
            <div className="mt-4 space-y-4 text-base leading-[1.8] text-muted-foreground">
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 30)}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
