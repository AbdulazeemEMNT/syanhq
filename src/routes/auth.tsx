import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Sign In — SYAN Intelligence" },
      {
        name: "description",
        content:
          "Secure sign-in for SYAN Media staff to access the SYAN Intelligence admin platform.",
      },
      { property: "og:title", content: "Staff Sign In — SYAN Intelligence" },
      {
        property: "og:description",
        content: "Secure sign-in for the SYAN Intelligence admin platform.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const authReturnPath = `${window.location.origin}/auth`;

      if (mode === "signup") {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: authReturnPath,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!signUpData.session) {
          setPendingEmail(email);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/admin", replace: true });
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
      const redirectTo = `${window.location.origin}/auth`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        toast.error(error.message || "Google sign-in failed");
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  if (pendingEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-5 py-16">
        <div className="w-full max-w-md rounded-[2rem] border border-hairline bg-card p-10 text-center">
          <h1 className="display-lg text-2xl">Confirm your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{pendingEmail}</strong>. Open it to activate your
            account, then come back and sign in.
          </p>
          <Button
            className="mt-6 w-full rounded-full"
            onClick={() => {
              setPendingEmail(null);
              setMode("signin");
            }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-5 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-hairline bg-card p-10">
        <Link to="/" className="eyebrow">
          SYAN Media
        </Link>
        <h1 className="display-lg mt-4 text-3xl">
          {mode === "signin" ? "Staff sign in" : "Create staff account"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Access to SYAN Intelligence project administration.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 rounded-full"
                required
              />
            </div>
          )}
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
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <Button variant="outline" onClick={onGoogle} className="mt-3 w-full rounded-full">
          Continue with Google
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin"
            ? "Need a staff account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
