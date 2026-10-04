import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERMISSIONS, ROLE_PRESETS, presetLabel, type Permission } from "@/lib/permissions";
import { inviteStaff, listStaff, removeStaff, updateStaff, type StaffRow } from "@/lib/staff.functions";

export const Route = createFileRoute("/_authenticated/admin/settings/")({
  component: StaffSettings,
});

type Preset = "super_admin" | "content_editor" | "communications" | "recruitment" | "custom";

function PermissionPicker(props: {
  preset: Preset;
  perms: Permission[];
  onChange: (preset: Preset, perms: Permission[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ROLE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => props.onChange(p.key as Preset, p.key === "custom" ? props.perms : p.permissions)}
            className={`rounded-full border border-hairline px-4 py-2 text-xs font-semibold ${props.preset === p.key ? "bg-navy text-navy-foreground border-navy" : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {PERMISSIONS.map((p) => (
          <label key={p.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={props.perms.includes(p.key)}
              onChange={(e) =>
                props.onChange(
                  "custom",
                  e.target.checked ? [...props.perms, p.key] : props.perms.filter((x) => x !== p.key),
                )
              }
            />
            {p.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function StaffSettings() {
  const qc = useQueryClient();
  const list = useServerFn(listStaff);
  const invite = useServerFn(inviteStaff);
  const update = useServerFn(updateStaff);
  const remove = useServerFn(removeStaff);

  const { data: staff = [], isLoading, error } = useQuery({ queryKey: ["staff"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["staff"] });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<Preset>("content_editor");
  const [perms, setPerms] = useState<Permission[]>(ROLE_PRESETS[1]!.permissions);
  const [sending, setSending] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPreset, setEditPreset] = useState<Preset>("custom");
  const [editPerms, setEditPerms] = useState<Permission[]>([]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error("Enter a valid email address."); return; }
    if (!perms.length) { toast.error("Choose at least one permission."); return; }
    setSending(true);
    try {
      const res = await invite({
        data: { email, full_name: name || undefined, role_preset: preset, permissions: perms, redirectTo: `${window.location.origin}/auth` },
      });
      toast.success(res.invited ? `Invitation sent to ${email}` : `${email} already had an account — access granted`);
      setEmail("");
      setName("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the invite.");
    } finally {
      setSending(false);
    }
  }

  async function run(fn: () => Promise<unknown>, msg: string) {
    try {
      await fn();
      toast.success(msg);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function startEdit(s: StaffRow) {
    setEditId(s.user_id);
    setEditPreset(s.role_preset as Preset);
    setEditPerms(s.permissions as Permission[]);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={sendInvite} className="soft-card space-y-5 p-8">
        <div>
          <h2 className="font-serif text-xl font-bold">Invite a staff member</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            They'll get an email invitation. There's no public sign-up — only invited people can get in.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-full" required />
          </div>
          <div>
            <Label>Name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 rounded-full" />
          </div>
        </div>
        <PermissionPicker preset={preset} perms={perms} onChange={(p, list) => { setPreset(p); setPerms(list); }} />
        <Button type="submit" className="rounded-full" disabled={sending}>
          {sending ? "Sending…" : "Send invitation"}
        </Button>
      </form>

      <div className="soft-card p-8">
        <h2 className="font-serif text-xl font-bold">Staff</h2>
        {isLoading ? (
          <p className="mt-5 text-sm text-muted-foreground">Loading staff…</p>
        ) : error ? (
          <p className="mt-5 text-sm text-destructive">{error instanceof Error ? error.message : "Couldn't load staff."}</p>
        ) : staff.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No staff yet. Invite your first team member above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline">
            {staff.map((s) => (
              <li key={s.user_id} className="space-y-4 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.full_name || s.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.email} · {s.is_owner ? "Owner" : presetLabel(s.role_preset)} ·{" "}
                      {s.last_sign_in_at ? "Has signed in" : "Invitation pending"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.permissions.map((p) => (
                        <span key={p} className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground">
                          {PERMISSIONS.find((x) => x.key === p)?.label ?? p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border border-hairline px-3 py-1 text-[11px] ${s.status === "disabled" ? "text-destructive" : ""}`}>
                      {s.status}
                    </span>
                    {!s.is_owner && (
                      <>
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => (editId === s.user_id ? setEditId(null) : startEdit(s))}>
                          {editId === s.user_id ? "Close" : "Change permissions"}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full"
                          onClick={() => run(() => update({ data: { user_id: s.user_id, status: s.status === "active" ? "disabled" : "active" } }), s.status === "active" ? "Access disabled" : "Access restored")}>
                          {s.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button variant="destructive" size="sm" className="rounded-full"
                          onClick={() => confirm(`Remove ${s.email}'s access to the CMS?`) && run(() => remove({ data: { user_id: s.user_id } }), "Access removed")}>
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {editId === s.user_id && (
                  <div className="rounded-2xl border border-hairline p-5 space-y-4">
                    <PermissionPicker preset={editPreset} perms={editPerms} onChange={(p, list) => { setEditPreset(p); setEditPerms(list); }} />
                    <Button size="sm" className="rounded-full"
                      onClick={() => run(async () => { await update({ data: { user_id: s.user_id, role_preset: editPreset, permissions: editPerms } }); setEditId(null); }, "Permissions updated")}>
                      Save permissions
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
