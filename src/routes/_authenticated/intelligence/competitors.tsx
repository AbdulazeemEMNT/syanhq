import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyWorkspace } from "@/lib/workspace";
import { RefreshCoverage } from "@/components/intelligence/RefreshCoverage";
import { SentimentBar, useRecentMentions, type MentionRow } from "@/components/intelligence/shared";

export const Route = createFileRoute("/_authenticated/intelligence/competitors")({
  head: () => ({ meta: [{ title: "Competitors — SYAN Intelligence" }, { name: "robots", content: "noindex" }] }),
  component: Competitors,
});

const MIN_TOTAL = 10;

function Competitors() {
  const { data: ws, isLoading: wsLoading } = useMyWorkspace();
  const { data = [], isLoading } = useRecentMentions(30);
  const competitors = (ws?.competitors ?? []).map((c) => c.trim()).filter(Boolean);

  const rows: { name: string; you: boolean; mentions: MentionRow[] }[] = [
    { name: ws?.organisation_name ?? "Your organisation", you: true, mentions: data.filter((m) => !m.subject) },
    ...competitors.map((c) => ({
      name: c,
      you: false,
      mentions: data.filter((m) => m.subject?.toLowerCase() === c.toLowerCase()),
    })),
  ];
  const total = rows.reduce((n, r) => n + r.mentions.length, 0);
  const competitorTotal = total - (rows[0]?.mentions.length ?? 0);
  const enough = total >= MIN_TOTAL && competitorTotal > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg text-3xl">Competitors</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            How real news coverage of you compares with the competitors you chose, over the last 30 days. The news
            check looks up your first three competitors.
          </p>
        </div>
        <RefreshCoverage />
      </div>

      {wsLoading || isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : competitors.length === 0 ? (
        <div className="soft-card p-8">
          <p className="font-serif text-lg font-bold">No competitors added</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Competitors are chosen during setup.{" "}
            <Link to="/intelligence/settings" className="font-semibold text-foreground underline underline-offset-4">
              See your settings
            </Link>{" "}
            or ask the SYAN team to add some for you.
          </p>
        </div>
      ) : (
        <>
          {!enough && (
            <div className="soft-card p-6">
              <p className="font-serif text-lg font-bold">More data is needed</p>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {total === 0
                  ? "No coverage collected yet. Check for new coverage to start comparing."
                  : `Only ${total} mention${total === 1 ? "" : "s"} collected so far${competitorTotal === 0 ? ", none about your competitors" : ""}. Share of conversation is shown once at least ${MIN_TOTAL} mentions include competitor coverage.`}
              </p>
            </div>
          )}

          <div className="soft-card overflow-x-auto p-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Organisation</th>
                  <th className="pb-3 pr-4 font-semibold">Mentions</th>
                  <th className="pb-3 pr-4 font-semibold">Share of conversation</th>
                  <th className="pb-3 pr-4 font-semibold">Sentiment</th>
                  <th className="pb-3 font-semibold">Media reach</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const share = enough && total ? Math.round((r.mentions.length / total) * 100) : null;
                  const known = r.mentions.filter((m) => m.reach != null);
                  const reach = known.reduce((n, m) => n + (m.reach ?? 0), 0);
                  return (
                    <tr key={r.name} className="border-t border-hairline align-top">
                      <td className="py-4 pr-4 font-semibold">
                        {r.name}
                        {r.you && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">You</span>}
                      </td>
                      <td className="num py-4 pr-4">{r.mentions.length}</td>
                      <td className="py-4 pr-4">
                        {share == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex min-w-[9rem] items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                              <div className={`h-full ${r.you ? "bg-navy" : "bg-muted-foreground/60"}`} style={{ width: `${share}%` }} />
                            </div>
                            <span className="num text-xs font-semibold">{share}%</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {r.mentions.length ? <SentimentBar rows={r.mentions} /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {known.length ? <span className="num text-foreground">{reach.toLocaleString()}</span> : "Not available"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-muted-foreground">
              Media reach is shown only when a source publishes audience figures. News sites currently don't, so it
              reads "Not available" rather than an estimate.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
