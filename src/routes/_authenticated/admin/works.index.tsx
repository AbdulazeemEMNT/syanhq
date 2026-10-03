import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify, useMyRoles } from "@/lib/admin-data";
import { parseMetrics, SLUG_PATTERN, WORK_COVER_BUCKET, type WorkMetric } from "@/lib/works";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/works/")({
  component: WorksAdmin,
});

type WorkRow = {
  id: string;
  slug: string;
  client: string;
  sector: string;
  headline: string;
  summary: string;
  challenge: string;
  brief: string | null;
  strategy: string | null;
  execution: string | null;
  outcome_narrative: string | null;
  testimonial: string | null;
  testimonial_author: string | null;
  engagement_period: string | null;
  approach: string[];
  results: string[];
  services: string[];
  deliverables: string[];
  metrics: unknown;
  published: boolean;
  featured: boolean;
  archived: boolean;
  sort_order: number;
  cover_image_path: string | null;
};

type Form = {
  headline: string;
  client: string;
  sector: string;
  slug: string;
  summary: string;
  challenge: string;
  brief: string;
  strategy: string;
  approach: string;
  execution: string;
  outcome_narrative: string;
  results: string;
  services: string;
  deliverables: string;
  metrics: WorkMetric[];
  testimonial: string;
  testimonial_author: string;
  engagement_period: string;
  published: boolean;
  featured: boolean;
  sort_order: string;
  cover_image_path: string | null;
};

const emptyForm: Form = {
  headline: "", client: "", sector: "", slug: "", summary: "", challenge: "", brief: "",
  strategy: "", approach: "", execution: "", outcome_narrative: "", results: "", services: "",
  deliverables: "", metrics: [], testimonial: "", testimonial_author: "", engagement_period: "",
  published: false, featured: false, sort_order: "0", cover_image_path: null,
};

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function coverUrl(path: string | null) {
  // signed URL fetched lazily by CoverPreview
  return path;
}

function CoverPreview({ path }: { path: string | null }) {
  const { data } = useQuery({
    queryKey: ["work-cover", path],
    enabled: !!path,
    queryFn: async () => {
      const { data } = await supabase.storage.from(WORK_COVER_BUCKET).createSignedUrl(path!, 3600);
      return data?.signedUrl ?? null;
    },
  });
  if (!path || !data) return null;
  return <img src={data} alt="Cover" className="aspect-[16/9] w-full max-w-sm rounded-2xl object-cover" />;
}

function WorksAdmin() {
  const qc = useQueryClient();
  const { data: roles = [], isLoading: rolesLoading } = useMyRoles();
  const isAdmin = roles.includes("admin");
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const { data: works = [], isLoading, error } = useQuery({
    queryKey: ["cms_case_studies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_case_studies")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as WorkRow[];
    },
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["cms_case_studies"] });
    qc.invalidateQueries({ queryKey: ["public-works"] });
  };

  function startNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: String((works.at(-1)?.sort_order ?? 0) + 10) });
    setErrors({});
    setOpen(true);
  }

  function startEdit(w: WorkRow) {
    setEditingId(w.id);
    setErrors({});
    setForm({
      headline: w.headline, client: w.client, sector: w.sector, slug: w.slug, summary: w.summary,
      challenge: w.challenge, brief: w.brief ?? "", strategy: w.strategy ?? "",
      approach: w.approach.join("\n"), execution: w.execution ?? "",
      outcome_narrative: w.outcome_narrative ?? "", results: w.results.join("\n"),
      services: w.services.join(", "), deliverables: w.deliverables.join(", "),
      metrics: parseMetrics(w.metrics), testimonial: w.testimonial ?? "",
      testimonial_author: w.testimonial_author ?? "", engagement_period: w.engagement_period ?? "",
      published: w.published, featured: w.featured, sort_order: String(w.sort_order),
      cover_image_path: w.cover_image_path,
    });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validate(): boolean {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.headline.trim()) e.headline = "Project title is required";
    if (!form.client.trim()) e.client = "Client is required";
    if (!form.sector.trim()) e.sector = "Sector is required";
    const slug = form.slug.trim() || slugify(form.headline || form.client);
    if (!SLUG_PATTERN.test(slug)) e.slug = "Use lowercase letters, numbers and hyphens only";
    else if (works.some((w) => w.slug === slug && w.id !== editingId)) e.slug = "Another work already uses this slug";
    if (!form.summary.trim()) e.summary = "Summary is required";
    if (!form.challenge.trim()) e.challenge = "Challenge is required";
    if (!/^-?\d+$/.test(form.sort_order.trim())) e.sort_order = "Must be a whole number";
    if (form.metrics.some((m) => !m.label.trim() || !m.value.trim())) e.metrics = "Each metric needs a value and a label";
    if (form.testimonial_author.trim() && !form.testimonial.trim()) e.testimonial = "Add the testimonial quote";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function uploadCover(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(WORK_COVER_BUCKET).upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) { toast.error(`Upload failed: ${error.message}`); return; }
    set("cover_image_path", path);
    toast.success("Cover uploaded — save to apply");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) { toast.error("Please fix the highlighted fields"); return; }
    setSaving(true);
    const payload = {
      headline: form.headline.trim(),
      client: form.client.trim(),
      sector: form.sector.trim(),
      slug: form.slug.trim() || slugify(form.headline || form.client),
      summary: form.summary.trim(),
      challenge: form.challenge.trim(),
      brief: form.brief.trim() || null,
      strategy: form.strategy.trim() || null,
      approach: lines(form.approach),
      execution: form.execution.trim() || null,
      outcome_narrative: form.outcome_narrative.trim() || null,
      results: lines(form.results),
      services: csv(form.services),
      deliverables: csv(form.deliverables),
      metrics: form.metrics.map((m) => ({ label: m.label.trim(), value: m.value.trim() })),
      testimonial: form.testimonial.trim() || null,
      testimonial_author: form.testimonial_author.trim() || null,
      engagement_period: form.engagement_period.trim() || null,
      published: form.published,
      featured: form.featured,
      sort_order: parseInt(form.sort_order, 10),
      cover_image_path: form.cover_image_path,
    };
    const { error } = editingId
      ? await supabase.from("cms_case_studies").update(payload).eq("id", editingId)
      : await supabase.from("cms_case_studies").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Work updated" : "Work created");
    setOpen(false);
    setEditingId(null);
    refresh();
  }

  async function update(id: string, patch: Partial<WorkRow>, msg: string) {
    const { error } = await supabase.from("cms_case_studies").update(patch as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(msg);
    refresh();
  }

  async function remove(w: WorkRow) {
    if (!confirm(`Permanently delete "${w.headline || w.client}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("cms_case_studies").delete().eq("id", w.id);
    if (error) { toast.error(error.message); return; }
    if (w.cover_image_path) await supabase.storage.from(WORK_COVER_BUCKET).remove([w.cover_image_path]);
    if (editingId === w.id) setOpen(false);
    toast.success("Work deleted");
    refresh();
  }

  if (rolesLoading) return <p className="text-sm text-muted-foreground">Checking access…</p>;
  if (!isAdmin) {
    return (
      <div className="soft-card p-8">
        <h1 className="display-lg text-3xl">Works</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only admins can manage works.</p>
      </div>
    );
  }

  const visible = works.filter((w) => w.archived === showArchived);
  const field = (k: keyof Form) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg text-3xl">Works</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Case studies shown on the public Our Work page. Drafts and archived works are never public.
          </p>
        </div>
        {!open && <Button className="rounded-full" onClick={startNew}>New work</Button>}
      </div>

      {open && (
        <form onSubmit={save} className="soft-card space-y-6 p-8" noValidate>
          <h2 className="font-serif text-xl font-bold">{editingId ? "Edit work" : "New work"}</h2>

          <div className="space-y-3">
            <Label>Cover image</Label>
            <CoverPreview path={coverUrl(form.cover_image_path)} />
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                className="max-w-xs rounded-full" />
              {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
              {form.cover_image_path && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set("cover_image_path", null)}>Remove</Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Project title *</Label>
              <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} className="mt-2 rounded-full" />
              {field("headline")}
            </div>
            <div>
              <Label>Client *</Label>
              <Input value={form.client} onChange={(e) => set("client", e.target.value)} className="mt-2 rounded-full" />
              {field("client")}
            </div>
            <div>
              <Label>Sector / category *</Label>
              <Input value={form.sector} onChange={(e) => set("sector", e.target.value)} className="mt-2 rounded-full" />
              {field("sector")}
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} placeholder={slugify(form.headline || form.client) || "auto-generated"}
                onChange={(e) => set("slug", e.target.value.toLowerCase())} className="mt-2 rounded-full" />
              {field("slug")}
            </div>
            <div>
              <Label>Engagement period</Label>
              <Input value={form.engagement_period} placeholder="e.g. 2023 – present"
                onChange={(e) => set("engagement_period", e.target.value)} className="mt-2 rounded-full" />
            </div>
          </div>

          {([
            ["summary", "Summary *", 3],
            ["challenge", "Challenge *", 3],
            ["brief", "Brief", 3],
            ["strategy", "Strategy", 4],
            ["approach", "Approach steps (one per line)", 4],
            ["execution", "Execution", 4],
            ["outcome_narrative", "Outcome", 4],
            ["results", "Results (one per line)", 4],
          ] as const).map(([k, label, rows]) => (
            <div key={k}>
              <Label>{label}</Label>
              <Textarea rows={rows} value={form[k]} onChange={(e) => set(k, e.target.value)} className="mt-2 rounded-2xl" />
              {field(k)}
            </div>
          ))}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Services (comma-separated)</Label>
              <Input value={form.services} onChange={(e) => set("services", e.target.value)}
                placeholder="Media Relations, Crisis Communications" className="mt-2 rounded-full" />
            </div>
            <div>
              <Label>Deliverables (comma-separated)</Label>
              <Input value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)}
                placeholder="Press kit, Launch event" className="mt-2 rounded-full" />
            </div>
          </div>

          <div>
            <Label>Metrics</Label>
            <div className="mt-2 space-y-2">
              {form.metrics.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Value (e.g. 40+)" value={m.value} className="w-40 rounded-full"
                    onChange={(e) => set("metrics", form.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  <Input placeholder="Label (e.g. national stories)" value={m.label} className="rounded-full"
                    onChange={(e) => set("metrics", form.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => set("metrics", form.metrics.filter((_, j) => j !== i))}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="rounded-full"
                onClick={() => set("metrics", [...form.metrics, { label: "", value: "" }])}>Add metric</Button>
              {field("metrics")}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div>
              <Label>Testimonial</Label>
              <Textarea rows={3} value={form.testimonial} onChange={(e) => set("testimonial", e.target.value)} className="mt-2 rounded-2xl" />
              {field("testimonial")}
            </div>
            <div>
              <Label>Testimonial author</Label>
              <Input value={form.testimonial_author} onChange={(e) => set("testimonial_author", e.target.value)}
                placeholder="Name, Title" className="mt-2 rounded-full" />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <div>
              <Label>Display order</Label>
              <Input value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} className="mt-2 w-28 rounded-full" />
              {field("sort_order")}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
              Published
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="rounded-full" disabled={saving || uploading}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create work"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => { setOpen(false); setEditingId(null); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="flex gap-2 text-sm">
        <button onClick={() => setShowArchived(false)}
          className={`rounded-full border border-hairline px-4 py-1 ${!showArchived ? "bg-secondary font-semibold" : ""}`}>
          Active ({works.filter((w) => !w.archived).length})
        </button>
        <button onClick={() => setShowArchived(true)}
          className={`rounded-full border border-hairline px-4 py-1 ${showArchived ? "bg-secondary font-semibold" : ""}`}>
          Archived ({works.filter((w) => w.archived).length})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-secondary" />)}</div>
      ) : error ? (
        <p className="text-sm text-destructive">Couldn't load works: {(error as Error).message}</p>
      ) : visible.length === 0 ? (
        <div className="soft-card p-8 text-center text-sm text-muted-foreground">
          {showArchived ? "No archived works." : "No works yet — create your first case study."}
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {visible.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="eyebrow">
                  #{w.sort_order} · {w.sector || "—"} {w.featured && <span className="text-accent">· Featured</span>}
                </p>
                <p className="mt-1 font-serif text-base font-bold">{w.headline || w.client}</p>
                <p className="text-xs text-muted-foreground">{w.client} · /work/{w.slug}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!w.archived && (
                  <button onClick={() => update(w.id, { published: !w.published }, w.published ? "Unpublished" : "Published")}
                    className="rounded-full border border-hairline px-3 py-1 text-xs">
                    {w.published ? "Published — unpublish" : "Draft — publish"}
                  </button>
                )}
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(w)}>Edit</Button>
                <Button variant="outline" size="sm" className="rounded-full"
                  onClick={() => update(w.id, w.archived ? { archived: false } : { archived: true, published: false },
                    w.archived ? "Restored as draft" : "Archived")}>
                  {w.archived ? "Restore" : "Archive"}
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={() => remove(w)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
