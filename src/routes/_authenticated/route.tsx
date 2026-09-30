import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ensureConfiguredAdminAccess, isConfiguredAdminEmail } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const user = data.user;

    // Signed-in staff without a role still reach the admin shell, where they can
    // claim the first admin seat or wait for an admin to grant them a role.
    if (isConfiguredAdminEmail(user.email)) {
      try {
        await ensureConfiguredAdminAccess(user);
      } catch {
        // Role bootstrap is best-effort; the shell handles the no-role state.
      }
    }

    return { user };
  },
  component: () => <Outlet />,
});
