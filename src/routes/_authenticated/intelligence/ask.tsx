import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/intelligence/ask")({
  component: AskSyan,
});

function AskSyan() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Ask SYAN</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A strategic assistant grounded in your project data — mentions, topics, competitors and
          reports — answering in your chosen tone.
        </p>
      </div>

      <div className="soft-card mx-auto max-w-2xl p-10 text-center">
        <p className="eyebrow">Coming soon</p>
        <h2 className="mt-4 font-serif text-2xl font-bold">The assistant is not connected yet</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Ask SYAN will answer only from the data held for your projects — it never invents metrics.
          Until a data provider and the AI service are connected, there is nothing honest to answer
          with, so the assistant stays switched off.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          In the meantime, each project's tone and standing instructions can already be configured
          under{" "}
          <Link
            to="/intelligence/projects"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Projects
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
