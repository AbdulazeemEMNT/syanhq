import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PERMS = ["dashboard.view", "works.manage", "articles.manage", "careers.manage", "messages.manage", "settings.manage"] as const;
const permList = z.array(z.enum(PERMS)).max(PERMS.length);
const preset = z.enum(["super_admin", "content_editor", "communications", "recruitment", "custom"]);

type Ctx = { supabase: any; userId: string };

async function assertManager(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_permission", {
    _user_id: context.userId,
    _permission: "settings.manage",
  });
  if (error || !data) throw new Error("You don't have permission to manage staff.");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertEditable(sb: any, actorId: string, targetId: string) {
  if (targetId === actorId) throw new Error("You can't change your own access.");
  const { data } = await sb.from("user_roles").select("role").eq("user_id", targetId).eq("role", "admin").maybeSingle();
  if (data) throw new Error("Workspace owners can't be changed here.");
}

export type InvitationRow = {
  id: string;
  email: string;
  full_name: string | null;
  role_preset: string;
  permissions: string[];
  status: string;
  created_at: string;
  expires_at: string;
};

export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InvitationRow[]> => {
    await assertManager(context);
    const { data, error } = await context.supabase
      .from("staff_invitations")
      .select("id,email,full_name,role_preset,permissions,status,created_at,expires_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const now = Date.now();
    return (data ?? []).map((r: InvitationRow) => ({
      ...r,
      status: new Date(r.expires_at).getTime() < now ? "expired" : r.status,
    }));
  });

export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertManager(context);
    const sb = await admin();
    const { error } = await sb.from("staff_invitations").update({ status: "revoked" }).eq("id", data.id).eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type StaffRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  role_preset: string;
  status: string;
  created_at: string;
  permissions: string[];
  is_owner: boolean;
  last_sign_in_at: string | null;
};

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffRow[]> => {
    await assertManager(context);
    const sb = await admin();
    const [{ data: members }, { data: perms }, { data: owners }] = await Promise.all([
      sb.from("staff_members").select("*").order("created_at"),
      sb.from("staff_permissions").select("user_id,permission"),
      sb.from("user_roles").select("user_id").eq("role", "admin"),
    ]);
    const { data: users } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const byId = new Map(users?.users.map((u) => [u.id, u]) ?? []);
    const rows: StaffRow[] = (members ?? []).map((m) => ({
      ...m,
      permissions: (perms ?? []).filter((p) => p.user_id === m.user_id).map((p) => p.permission),
      is_owner: false,
      last_sign_in_at: byId.get(m.user_id)?.last_sign_in_at ?? null,
    }));
    for (const o of owners ?? []) {
      const u = byId.get(o.user_id);
      const existing = rows.find((r) => r.user_id === o.user_id);
      if (existing) {
        existing.is_owner = true;
        existing.permissions = [...PERMS];
        continue;
      }
      rows.unshift({
        user_id: o.user_id,
        email: u?.email ?? "—",
        full_name: (u?.user_metadata?.["full_name"] as string | undefined) ?? null,
        role_preset: "super_admin",
        status: "active",
        created_at: u?.created_at ?? "",
        permissions: [...PERMS],
        is_owner: true,
        last_sign_in_at: u?.last_sign_in_at ?? null,
      });
    }
    return rows;
  });

export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      email: z.string().trim().toLowerCase().email().max(255),
      full_name: z.string().trim().max(120).optional(),
      role_preset: preset,
      permissions: permList.min(1, "Choose at least one permission"),
      redirectTo: z.string().url().max(500),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertManager(context);
    const sb = await admin();

    const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === data.email);
    if (existing) await assertEditable(sb, context.userId, existing.id);

    // The invitation is the allowlist: access is granted only when this email signs in.
    await sb.from("staff_invitations").update({ status: "revoked" }).eq("status", "pending").ilike("email", data.email);
    const { error: iErr } = await sb.from("staff_invitations").insert({
      email: data.email,
      full_name: data.full_name || null,
      role_preset: data.role_preset,
      permissions: data.permissions,
      invited_by: context.userId,
    });
    if (iErr) throw new Error(iErr.message);

    let invited = false;
    if (!existing) {
      const { error } = await sb.auth.admin.inviteUserByEmail(data.email, {
        redirectTo: data.redirectTo,
        data: data.full_name ? { full_name: data.full_name } : {},
      });
      invited = !error;
    }
    return { invited, existing: !!existing };
  });

export const updateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      user_id: z.string().uuid(),
      role_preset: preset.optional(),
      permissions: permList.optional(),
      status: z.enum(["active", "disabled"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertManager(context);
    const sb = await admin();
    await assertEditable(sb, context.userId, data.user_id);
    const patch: { role_preset?: string; status?: string } = {};
    if (data.role_preset) patch.role_preset = data.role_preset;
    if (data.status) patch.status = data.status;
    if (Object.keys(patch).length) {
      const { error } = await sb.from("staff_members").update(patch).eq("user_id", data.user_id);
      if (error) throw new Error(error.message);
    }
    if (data.permissions) {
      await sb.from("staff_permissions").delete().eq("user_id", data.user_id);
      if (data.permissions.length) {
        const { error } = await sb
          .from("staff_permissions")
          .insert(data.permissions.map((permission) => ({ user_id: data.user_id, permission })));
        if (error) throw new Error(error.message);
      }
    }
    return { ok: true };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertManager(context);
    const sb = await admin();
    await assertEditable(sb, context.userId, data.user_id);
    const { data: member } = await sb.from("staff_members").select("email").eq("user_id", data.user_id).maybeSingle();
    if (member?.email) {
      await sb.from("staff_invitations").update({ status: "revoked" }).eq("status", "pending").ilike("email", member.email);
    }
    const { error } = await sb.from("staff_members").delete().eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
