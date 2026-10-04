import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useMyWorkspace } from "@/lib/workspace";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles, useSession } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/intelligence")({
  component: IntelligenceLayout,
});

const nav = [
  { to: "/intelligence/overview", label: "Overview", exact: true },
  { to: "/intelligence/mentions", label: "Mentions" },
  { to: "/intelligence/topics", label: "Topics" },
  { to: "/intelligence/competitors", label: "Competitors" },
  { to: "/intelligence/reports", label: "Reports" },
  { to: "/intelligence/ask", label: "Ask SYAN" },
  { to: "/intelligence/settings", label: "Settings" },
] as const;



function IntelligenceLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: roles = [], isSuccess: rolesLoaded } = useMyRoles();
  const workspace = useMyWorkspace();

  // New organisations (no SYAN staff role, no workspace yet) start with the setup wizard.
  useEffect(() => {
    if (rolesLoaded && roles.length === 0 && workspace.isSuccess && !workspace.data) {
      navigate({ to: "/intelligence-setup", replace: true });
    }
  }, [rolesLoaded, roles.length, workspace.isSuccess, workspace.data, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-hairline bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-lg font-bold">
              SYAN
            </Link>
            <span className="eyebrow">SYAN Intelligence</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <span className="rounded-full border border-hairline px-3 py-1 text-xs">
              {roles.length ? roles.join(", ") : "no role"}
            </span>
            <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-4 lg:px-8">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              activeProps={{ className: "bg-navy text-navy-foreground border-navy" }}
              className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold"
            >
              {item.label}
            </Link>
          ))}
          
        </div>
      </header>

      {roles.length === 0 && (
        <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
          <div className="soft-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="font-serif text-base font-bold">No staff role assigned</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You can see this shell, but project data stays hidden until an admin grants you a
                role.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
