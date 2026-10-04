import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { refreshMentions } from "@/lib/mentions.functions";

export function RefreshCoverage({ label = "Check for new coverage" }: { label?: string }) {
  const run = useServerFn(refreshMentions);
  const qc = useQueryClient();
  const [state, setState] = useState<{ busy: boolean; msg?: string; err?: boolean }>({ busy: false });

  async function go() {
    setState({ busy: true });
    try {
      const r = await run();
      await qc.invalidateQueries({ queryKey: ["intelligence"] });
      setState({ busy: false, msg: r.found ? `Checked the news — ${r.found} article${r.found === 1 ? "" : "s"} from the last 7 days.` : "No news coverage found in the last 7 days." });
    } catch (e) {
      setState({ busy: false, err: true, msg: e instanceof Error ? e.message : "Something went wrong. Please try again." });
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={go} disabled={state.busy} className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-navy-foreground disabled:opacity-60">
        {state.busy ? "Checking the news… (up to a minute)" : label}
      </button>
      {state.msg && <p className={`text-xs ${state.err ? "text-destructive" : "text-muted-foreground"}`}>{state.msg}</p>}
    </div>
  );
}
