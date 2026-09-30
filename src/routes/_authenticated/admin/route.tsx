import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles, useSession } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/alerts", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/integrations", label: "Integrations & API" },
  { to: "/admin/users", label: "Users & Roles" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: roles = [] } = useMyRoles();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function claimAdmin() {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("You are now the workspace admin.");
      queryClient.invalidateQueries();
    } else {
      toast.error("An admin already exists. Ask them to grant you access.");
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-hairline bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-lg font-bold">
              SYAN
            </Link>
            <span className="eyebrow">Intelligence Admin</span>
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
                role. If this is a new workspace, claim the first admin seat.
              </p>
            </div>
            <Button className="rounded-full" onClick={claimAdmin}>
              Claim admin access
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
