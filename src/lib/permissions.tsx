import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PERMISSIONS = [
  { key: "dashboard.view", label: "Dashboard" },
  { key: "works.manage", label: "Works" },
  { key: "articles.manage", label: "Articles" },
  { key: "careers.manage", label: "Careers" },
  { key: "messages.manage", label: "Messages" },
  { key: "settings.manage", label: "Settings & staff" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["key"];

export const ROLE_PRESETS: { key: string; label: string; permissions: Permission[] }[] = [
  { key: "super_admin", label: "Super Admin", permissions: PERMISSIONS.map((p) => p.key) },
  { key: "content_editor", label: "Content Editor", permissions: ["dashboard.view", "works.manage", "articles.manage", "careers.manage"] },
  { key: "communications", label: "Communications", permissions: ["dashboard.view", "articles.manage", "messages.manage"] },
  { key: "recruitment", label: "Recruitment", permissions: ["dashboard.view", "careers.manage", "messages.manage"] },
  { key: "custom", label: "Custom", permissions: [] },
];

export function presetLabel(key: string) {
  return ROLE_PRESETS.find((p) => p.key === key)?.label ?? "Custom";
}

export function usePermissions() {
  return useQuery({
    queryKey: ["my-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_permissions");
      if (error) throw error;
      return (data ?? []) as Permission[];
    },
  });
}

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { data, isLoading } = usePermissions();
  if (isLoading) return <p className="text-sm text-muted-foreground">Checking access…</p>;
  if (!data?.includes(permission)) {
    return (
      <div className="soft-card p-8">
        <p className="font-serif text-lg font-bold">You don't have access to this section</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask a Super Admin to grant you the “{PERMISSIONS.find((p) => p.key === permission)?.label}” permission.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
