import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RequirePermission } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <RequirePermission permission="settings.manage">
      <div className="space-y-8">
        <div>
          <h1 className="display-lg text-3xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Who can use this CMS and what they can change.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/settings"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-navy text-navy-foreground border-navy" }}
            className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold"
          >
            Staff & Permissions
          </Link>
        </div>
        <Outlet />
      </div>
    </RequirePermission>
  );
}
