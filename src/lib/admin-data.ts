import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Project = Tables<"intelligence_projects">;
export type Keyword = Tables<"project_keywords">;
export type Competitor = Tables<"project_competitors">;
export type Source = Tables<"project_sources">;
export type Alert = Tables<"project_alerts">;
export type Report = Tables<"intelligence_reports">;
export type Integration = Tables<"integrations">;

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase();

export function getConfiguredAdminEmails() {
  const configured =
    (import.meta.env.VITE_ALLOWED_ADMIN_EMAILS as string | undefined) ??
    (typeof process !== "undefined" ? process.env.ALLOWED_ADMIN_EMAILS : undefined) ??
    "";

  return configured
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean) as string[];
}

export function isConfiguredAdminEmail(email?: string | null) {
  const normalized = normalizeEmail(email);
  return normalized ? getConfiguredAdminEmails().includes(normalized) : false;
}

export async function ensureConfiguredAdminAccess(user?: { id?: string; email?: string | null } | null) {
  if (!user?.id || !user.email) return false;
  if (!isConfiguredAdminEmail(user.email)) return false;

  const { data: existingRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError) throw rolesError;
  if ((existingRoles ?? []).some((row) => row.role === "admin")) return true;

  const { data, error } = await supabase.rpc("claim_first_admin");
  if (error) throw error;
  return Boolean(data);
}

export async function getUserRolesForUser(userId?: string | null, email?: string | null) {
  if (!userId) return [] as string[];

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw error;

  const roles = (data ?? []).map((row) => row.role as string);
  if (isConfiguredAdminEmail(email) && !roles.includes("admin")) {
    await ensureConfiguredAdminAccess({ id: userId, email });
    const refreshed = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    return (refreshed.data ?? []).map((row) => row.role as string);
  }

  return roles;
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
  });
}

export function useMyRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const email = userData.user?.email ?? null;
      if (!uid) return [] as string[];

      return getUserRolesForUser(uid, email);
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Project | null;
    },
  });
}

export function useChildRows<T>(
  table: "project_keywords" | "project_competitors" | "project_sources",
  projectId: string,
) {
  return useQuery({
    queryKey: [table, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
