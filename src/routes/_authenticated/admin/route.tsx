import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles, useSession } from "@/lib/admin-data";
import { usePermissions, type Permission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import syanLogo from "@/assets/syan-logo-full.png";

// Central gate for every /admin/* page: the parent layout has already verified the
// session; here we resolve permissions before anything renders.
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    // Turn a pending invitation for this verified email into staff access (no-op otherwise).
    await supabase.rpc("accept_staff_invitation");
    const permissions = await context.queryClient.fetchQuery({
      queryKey: ["my-permissions"],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("my_permissions");
        if (error) throw error;
        return (data ?? []) as Permission[];
      },
      staleTime: 0,
    });
    return { permissions };
  },
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Checking access…
    </div>
  ),
  component: AdminLayout,
});

const nav: { to: "/admin" | "/admin/works" | "/admin/articles" | "/admin/careers" | "/admin/messages" | "/admin/settings"; label: string; perm: Permission; exact?: boolean }[] = [
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
  const { permissions: initialPerms } = Route.useRouteContext();
  const { data: perms = initialPerms } = usePermissions();
  const isOwner = roles.includes("admin");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (perms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-5 py-16">
        <div className="w-full max-w-md rounded-[2rem] border border-hairline bg-card p-10 text-center">
          <h1 className="display-lg text-2xl">No access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {user?.email ?? "This account"} isn't authorised to use the SYAN Media CMS, or its
            access has been disabled. Ask a Super Admin to invite you.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Back to website</Link>
            </Button>
            <Button className="rounded-full" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-hairline bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="SYAN Media — home">
              <img src={syanLogo} alt="SYAN Media" className="h-6 w-auto" />
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

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
