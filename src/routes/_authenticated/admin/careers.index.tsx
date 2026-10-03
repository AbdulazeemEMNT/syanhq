import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { slugify } from "@/lib/admin-data";
import { SLUG_PATTERN } from "@/lib/works";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/careers/")({
  component: CareersAdmin,
});

type CareerRow = Tables<"cms_careers">;

const emptyForm = {
  title: "",
  slug: "",
  employment_type: "Full-time",
  location: "Lagos, Nigeria",
  department: "",
  detail: "",
  full_description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  application_url: "",
  closing_date: "",
  sort_order: "0",
  published: true,
};
type Form = typeof emptyForm;

const toList = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
const today = () => new Date().toISOString().slice(0, 10);

function statusOf(c: CareerRow) {
  if (c.archived) return "closed";
  if (c.closing_date && c.closing_date < today()) return "expired";
  return c.published ? "open" : "draft";
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.title.trim()) e.title = "Job title is required";
  const slug = f.slug.trim() || slugify(f.title);
  if (!SLUG_PATTERN.test(slug)) e.slug = "Use lowercase letters, numbers and hyphens";
  if (!f.detail.trim()) e.detail = "Short description is required";
  if (f.application_url && !/^(https?:\/\/|mailto:)/.test(f.application_url))
    e.application_url = "Must start with https:// or mailto:";
  if (!/^-?\d+$/.test(f.sort_order)) e.sort_order = "Must be a whole number";
  return e;
}

function CareersAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [tab, setTab] = useState<"active" | "closed">("active");
  const [saving, setSaving] = useState(false);

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ["cms_careers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_careers")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["cms_careers"] });
    qc.invalidateQueries({ queryKey: ["public-careers"] });
  };
  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };
  const set = (k: keyof Form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(c: CareerRow) {
    setEditingId(c.id);
    setErrors({});
    setForm({
      title: c.title,
      slug: c.slug,
      employment_type: c.employment_type,
      location: c.location,
      department: c.department ?? "",
      detail: c.detail,
      full_description: c.full_description ?? "",
      responsibilities: c.responsibilities.join("\n"),
      requirements: c.requirements.join("\n"),
      benefits: c.benefits.join("\n"),
      application_url: c.application_url ?? "",
      closing_date: c.closing_date ?? "",
      sort_order: String(c.sort_order),
      published: c.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      employment_type: form.employment_type.trim(),
      location: form.location.trim(),
      department: form.department.trim() || null,
      detail: form.detail.trim(),
      full_description: form.full_description.trim() || null,
      responsibilities: toList(form.responsibilities),
      requirements: toList(form.requirements),
      benefits: toList(form.benefits),
      application_url: form.application_url.trim() || null,
      closing_date: form.closing_date || null,
      sort_order: Number(form.sort_order),
      published: form.published,
    };
    const { error } = editingId
      ? await supabase.from("cms_careers").update(payload).eq("id", editingId)
      : await supabase.from("cms_careers").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.code === "23505" ? "That slug is already in use" : error.message);
      return;
    }
    toast.success(editingId ? "Position updated" : "Position created");
    reset();
    refresh();
  }

  async function update(id: string, patch: Partial<CareerRow>, msg: string) {
    const { error } = await supabase.from("cms_careers").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(msg);
    refresh();
  }

  async function remove(c: CareerRow) {
    if (!confirm(`Delete "${c.title}" permanently?`)) return;
    const { error } = await supabase.from("cms_careers").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    if (editingId === c.id) reset();
    toast.success("Position deleted");
    refresh();
  }

  const visible = roles.filter((r) => (tab === "closed" ? r.archived : !r.archived));
  const field = (k: keyof Form, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div>
      <Label>{label}</Label>
      <Input
        value={form[k] as string}
        onChange={(e) => set(k, e.target.value)}
        className="mt-2 rounded-full"
        {...props}
      />
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );
  const area = (k: keyof Form, label: string, cls = "") => (
    <div>
      <Label>{label}</Label>
      <Textarea
        value={form[k] as string}
        onChange={(e) => set(k, e.target.value)}
        className={`mt-2 rounded-2xl ${cls}`}
      />
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Careers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open roles shown on the public Careers page. Only published, open positions before their
          closing date appear publicly.
        </p>
      </div>

      <form onSubmit={save} className="soft-card space-y-5 p-8" noValidate>
        <h2 className="font-serif text-xl font-bold">{editingId ? "Edit position" : "Create a position"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field("title", "Job title *")}
          {field("slug", "Slug", { placeholder: slugify(form.title) || "auto-from-title" })}
          {field("employment_type", "Employment type")}
          {field("location", "Location")}
          {field("department", "Department")}
          {field("application_url", "Application URL", { placeholder: "https://… or mailto:…" })}
          {field("closing_date", "Closing date", { type: "date" })}
          {field("sort_order", "Display order", { inputMode: "numeric" })}
        </div>
        {area("detail", "Short description *")}
        {area("full_description", "Full description", "min-h-32")}
        <div className="grid gap-4 md:grid-cols-3">
          {area("responsibilities", "Responsibilities (one per line)", "min-h-32")}
          {area("requirements", "Requirements (one per line)", "min-h-32")}
          {area("benefits", "Benefits (one per line)", "min-h-32")}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
          Published
        </label>
        <div className="flex gap-3">
          <Button type="submit" className="rounded-full" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Create position"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="flex gap-2">
        {(["active", "closed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border border-hairline px-4 py-1.5 text-sm ${tab === t ? "bg-secondary font-semibold" : ""}`}
          >
            {t === "active" ? "Active" : "Closed"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Couldn't load positions: {(error as Error).message}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tab === "active" ? "No positions yet." : "No closed positions."}
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {visible.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="eyebrow">
                  {[c.department, c.employment_type].filter(Boolean).join(" · ")} · #{c.sort_order}
                </p>
                <p className="mt-1 font-serif text-base font-bold">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.location}
                  {c.closing_date ? ` · closes ${c.closing_date}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-hairline px-3 py-1 text-xs">{statusOf(c)}</span>
                {!c.archived && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      update(c.id, { published: !c.published }, c.published ? "Unpublished" : "Published")
                    }
                  >
                    {c.published ? "Unpublish" : "Publish"}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(c)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => update(c.id, { archived: !c.archived }, c.archived ? "Reopened" : "Closed")}
                >
                  {c.archived ? "Reopen" : "Close"}
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={() => remove(c)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
