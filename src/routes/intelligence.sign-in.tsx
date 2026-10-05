import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import syanLogo from "@/assets/syan-logo-full.png";

export const Route = createFileRoute("/intelligence/sign-in")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { mode?: "signin" | "signup" | undefined } => ({
    mode: s["mode"] === "signup" ? "signup" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — SYAN Intelligence" },
      { name: "description", content: "Sign in or create your organisation's SYAN Intelligence account." },
      { property: "og:title", content: "Sign in — SYAN Intelligence" },
      { property: "og:description", content: "Access your organisation's SYAN Intelligence workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IntelligenceSignIn,
});

function IntelligenceSignIn() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const go = () => navigate({ to: "/intelligence/overview", replace: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void go();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/intelligence/sign-in`,
            data: { full_name: name.trim() || undefined },
          },
        });
        if (error) throw error;
        if (data.session) void go();
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void go();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
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
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/intelligence/sign-in`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) return void toast.error(result.error.message || "Google sign-in failed");
    if (result.redirected) return;
    const { data } = await supabase.auth.getSession();
    if (data.session) void go();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-hairline bg-card p-10">
        <Link to="/intelligence" aria-label="SYAN Intelligence">
          <img src={syanLogo} alt="SYAN Media" className="h-7 w-auto" />
        </Link>
        <h1 className="display-lg mt-4 text-3xl">
          {mode === "signup" ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Set up your organisation's workspace in a few short steps."
            : "Access your organisation's Intelligence workspace."}
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-hairline p-5 text-sm">
            We've sent a confirmation link to <strong>{email}</strong>. Open it to finish creating
            your account, then you'll be taken to setup.
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 rounded-full" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-full" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-full" minLength={8} required />
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-full">
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <Button variant="outline" onClick={onGoogle} className="mt-3 w-full rounded-full">
              Continue with Google
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account?" : "New to SYAN Intelligence?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="font-semibold text-foreground underline underline-offset-4"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
