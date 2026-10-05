import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import syanMark from "@/assets/syan-logo-mark-dark.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { next?: string | undefined } => ({
    next: typeof s["next"] === "string" && s["next"].startsWith("/") && !s["next"].startsWith("//") ? s["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Staff Sign In — SYAN Media" },
      {
        name: "description",
        content:
          "Secure sign-in for SYAN Media staff to access the SYAN Media CMS.",
      },
      { property: "og:title", content: "Staff Sign In — SYAN Media" },
      {
        property: "og:description",
        content: "Secure sign-in for the SYAN Media CMS.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const go = () => {
    if (next) window.location.assign(next);
    else
      void supabase.rpc("my_permissions").then(({ data }) =>
        navigate({ to: (data ?? []).length ? "/admin" : "/intelligence/overview", replace: true }),
      );
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
  }, [navigate, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data } = await supabase.auth.getSession();
      if (data.session) go();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(
        message.toLowerCase().includes("security purposes")
          ? "Too many attempts in a row. Please wait a minute, then try again."
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: next ? window.location.origin + next : window.location.origin,
        extraParams: { prompt: "select_account" },
      });

      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }

      if (result.redirected) return;

      const { data } = await supabase.auth.getSession();
      if (data.session) go();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-5 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-hairline bg-card p-10">
        <Link to="/" aria-label="SYAN Media — home">
          <img src={syanMark} alt="SYAN Media" className="h-7 w-auto" />
        </Link>
        <h1 className="display-lg mt-4 text-3xl">
"Staff sign in"
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          For invited SYAN Media staff only.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 rounded-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 rounded-full"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            {busy ? "Please wait…" : "Sign in"}
          </Button>
        </form>

        <Button variant="outline" onClick={onGoogle} className="mt-3 w-full rounded-full">
          Continue with Google
        </Button>

      </div>
    </div>
  );
}
