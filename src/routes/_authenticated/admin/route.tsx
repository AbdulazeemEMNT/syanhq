import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles, useSession } from "@/lib/admin-data";
import { usePermissions, type Permission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav: { to: string; label: string; perm: Permission; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", perm: "dashboard.view", exact: true },
  { to: "/admin/works", label: "Works", perm: "works.manage" },
  { to: "/admin/articles", label: "Articles", perm: "articles.manage" },
  { to: "/admin/careers", label: "Careers", perm: "careers.manage" },
  { to: "/admin/messages", label: "Messages", perm: "messages.manage" },
  { to: "/admin/settings", label: "Settings", perm: "settings.manage" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: roles = [] } = useMyRoles();
  const { data: perms = [], isLoading: permsLoading } = usePermissions();
  const isOwner = roles.includes("admin");

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
            <span className="eyebrow">Website Content</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {isOwner && (<Link
              to="/intelligence/overview"
              className="text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              SYAN Intelligence
            </Link>)}
            <span className="text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-4 lg:px-8">
          {nav.filter((item) => perms.includes(item.perm)).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: !!item.exact }}
              activeProps={{ className: "bg-navy text-navy-foreground border-navy" }}
              className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      {!permsLoading && perms.length === 0 && (
        <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
          <div className="soft-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="font-serif text-base font-bold">No access yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your account has no permissions, or your access has been disabled. Ask a Super
                Admin to invite you. If this is a brand-new workspace, claim the owner seat.
              </p>
            </div>
            <Button className="rounded-full" onClick={claimAdmin}>
              Claim owner access
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
