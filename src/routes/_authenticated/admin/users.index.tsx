import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users/")({
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const { data: myRoles = [] } = useMyRoles();
  const isAdmin = myRoles.includes("admin");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"analyst" | "viewer">("analyst");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["staff-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("*");
      if (rolesError) throw rolesError;
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));
    },
  });

  async function grantByEmail(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.rpc("user_roles_write_admin", {
      _email: email,
      _role: role,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data === false) {
      toast.error("No account found with that email, or you lack admin rights.");
      return;
    }
    toast.success("Role granted");
    setEmail("");
    qc.invalidateQueries({ queryKey: ["staff-users"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="soft-card p-8">
        <h1 className="font-serif text-2xl font-bold">Users &amp; roles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Roles: <span className="font-semibold">admin</span> (full control),{" "}
          <span className="font-semibold">analyst</span> (create and edit),{" "}
          <span className="font-semibold">viewer</span> (read only).
        </p>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && users.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No staff accounts yet.</p>
        )}

        <ul className="mt-6 divide-y divide-hairline">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">{u.full_name ?? u.email ?? "Unnamed user"}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex gap-2">
                {u.roles.length === 0 ? (
                  <span className="rounded-full border border-hairline px-3 py-1 text-xs text-muted-foreground">
                    no role
                  </span>
                ) : (
                  u.roles.map((r) => (
                    <span key={r} className="rounded-full border border-hairline px-3 py-1 text-xs">
                      {r}
                    </span>
                  ))
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="soft-card h-fit p-8">
        <h2 className="font-serif text-lg font-bold">Grant a role</h2>
        {isAdmin ? (
          <form onSubmit={grantByEmail} className="mt-4 space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@syanmedia.com"
              className="rounded-full"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "analyst" | "viewer")}
              className="w-full rounded-full border border-hairline bg-card px-4 py-2 text-sm"
            >
              <option value="analyst">analyst</option>
              <option value="viewer">viewer</option>
            </select>
            <Button type="submit" className="w-full rounded-full">
              Grant role
            </Button>
            <p className="text-xs text-muted-foreground">
              The person must already have an account — they can create one on the sign-in page.
            </p>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Only admins can grant roles. Ask your workspace admin for access.
          </p>
        )}
      </div>
    </div>
  );
}
