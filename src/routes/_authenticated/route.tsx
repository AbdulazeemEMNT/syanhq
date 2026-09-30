import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ensureConfiguredAdminAccess, getUserRolesForUser, isConfiguredAdminEmail } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const user = data.user;
    const roles = await getUserRolesForUser(user.id, user.email);

    if (roles.length === 0 && isConfiguredAdminEmail(user.email)) {
      const granted = await ensureConfiguredAdminAccess(user);
      if (granted) return { user };
    }

    if (roles.length === 0) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
