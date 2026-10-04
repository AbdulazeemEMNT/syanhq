import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { slugify } from "@/lib/admin-data";
import { SLUG_PATTERN, WORK_COVER_BUCKET } from "@/lib/works";
import { RequirePermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/articles/")({
  component: () => (
    <RequirePermission permission="articles.manage">
      <ArticlesAdmin />
    </RequirePermission>
  ),
});

type Article = Tables<"cms_articles">;

type Form = {
  title: string; slug: string; excerpt: string; author: string; category: string; tags: string;
  body: string; reading_time: string; published_at: string; seo_title: string;
  seo_description: string; featured: boolean; cover_image_path: string | null;
};

const empty: Form = {
  title: "", slug: "", excerpt: "", author: "", category: "Insight", tags: "", body: "",
  reading_time: "", published_at: "", seo_title: "", seo_description: "", featured: false,
  cover_image_path: null,
};

function statusOf(a: Article) {
  if (a.archived) return "archived";
  if (!a.published) return "draft";
  if (a.published_at && new Date(a.published_at) > new Date()) return "scheduled";
  return "published";
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.title.trim().length < 3) e.title = "Add a title (at least 3 characters).";
  const slug = f.slug.trim() || slugify(f.title);
  if (!SLUG_PATTERN.test(slug)) e.slug = "Use lowercase letters, numbers and hyphens only.";
  if (!f.category.trim()) e.category = "Add a category.";
  if (f.seo_description.length > 160) e.seo_description = "Keep it under 160 characters.";
  if (f.seo_title.length > 70) e.seo_title = "Keep it under 70 characters.";
  return e;
}

function Cover({ path }: { path: string | null }) {
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

function ArticlesAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["cms_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_articles")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["cms_articles"] });
    qc.invalidateQueries({ queryKey: ["count"] });
    qc.invalidateQueries({ queryKey: ["public-articles"] });
  };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function startNew() {
    setEditing("new");
    setForm(empty);
    setErrors({});
  }
  function startEdit(a: Article) {
    setEditing(a.id);
    setErrors({});
    setForm({
      title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", author: a.author ?? "",
      category: a.category, tags: (a.tags ?? []).join(", "), body: a.body ?? "",
      reading_time: a.reading_time ?? "", published_at: a.published_at ? a.published_at.slice(0, 10) : "",
      seo_title: a.seo_title ?? "", seo_description: a.seo_description ?? "", featured: a.featured,
      cover_image_path: a.cover_image_path,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function upload(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Images must be under 5 MB."); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    const path = `articles/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
    const { error } = await supabase.storage.from(WORK_COVER_BUCKET).upload(path, file, { contentType: file.type });
    if (error) { toast.error(error.message); return; }
    set("cover_image_path", path);
    toast.success("Cover uploaded — save to keep it.");
  }

  async function save(publish: boolean) {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Please fix the highlighted fields."); return; }
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || null,
      author: form.author.trim() || null,
      category: form.category.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      body: form.body.trim() || null,
      reading_time: form.reading_time.trim() || null,
      published_at: form.published_at
        ? (() => {
            // Interpret the picked day in local time; today or earlier goes live now.
            const picked = new Date(`${form.published_at}T00:00:00`);
            const keep = editing && a0?.published_at?.slice(0, 10) === form.published_at;
            if (keep) return a0!.published_at as string;
            return picked > new Date() ? picked.toISOString() : new Date(Math.min(Date.now(), picked.getTime() + 864e5 - 1)).toISOString();
          })()
        : publish ? new Date().toISOString() : null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      featured: form.featured,
      cover_image_path: form.cover_image_path,
      published: publish,
    };
    const { error } =
      editing && editing !== "new"
        ? await supabase.from("cms_articles").update(payload).eq("id", editing)
        : await supabase.from("cms_articles").insert(payload);
    setBusy(false);
    if (error) {
      if (error.code === "23505") setErrors({ slug: "Another article already uses this slug." });
      { toast.error(error.code === "23505" ? "That slug is taken." : error.message); return; }
    }
    toast.success(publish ? "Article published" : "Draft saved");
    setEditing(null);
    refresh();
  }

  async function patch(a: Article, values: Partial<Article>, msg: string) {
    const { error } = await supabase.from("cms_articles").update(values).eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    toast.success(msg);
    refresh();
  }

  async function remove(a: Article) {
    if (!confirm(`Permanently delete "${a.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("cms_articles").delete().eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    if (a.cover_image_path) await supabase.storage.from(WORK_COVER_BUCKET).remove([a.cover_image_path]);
    if (editing === a.id) setEditing(null);
    toast.success("Article deleted");
    refresh();
  }

  const q = search.trim().toLowerCase();
  const visible = articles.filter(
    (a) =>
      (tab === "archived" ? a.archived : !a.archived) &&
      (!q || `${a.title} ${a.category} ${a.author ?? ""}`.toLowerCase().includes(q)),
  );

  const field = (k: keyof Form, label: string, props: { placeholder?: string; type?: string } = {}) => (
    <div>
      <Label>{label}</Label>
      <Input
        type={props.type}
        value={form[k] as string}
        placeholder={props.placeholder}
        onChange={(e) => set(k, e.target.value as never)}
        className="mt-2 rounded-full"
      />
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg text-3xl">Articles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Published articles appear on the public Insights pages.
          </p>
        </div>
        {!editing && (
          <Button className="rounded-full" onClick={startNew}>New article</Button>
        )}
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); void save(true); }} className="soft-card space-y-6 p-8">
          <h2 className="font-serif text-xl font-bold">{editing === "new" ? "New article" : "Edit article"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {field("title", "Title")}
            {field("slug", "Slug", { placeholder: form.title ? slugify(form.title) : "auto from title" })}
            {field("author", "Author")}
            {field("category", "Category")}
            {field("tags", "Tags", { placeholder: "Comma separated, e.g. PR, AI search" })}
            {field("reading_time", "Reading time", { placeholder: "6 min read" })}
            {field("published_at", "Publish date", { type: "date" })}
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                Featured (shown first on Insights)
              </label>
            </div>
            <div className="md:col-span-2 space-y-3">
              <Label>Cover image</Label>
              <Cover path={form.cover_image_path} />
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" className="max-w-xs rounded-full"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                {form.cover_image_path && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => set("cover_image_path", null)}>Remove</Button>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="mt-2 rounded-2xl" />
            </div>
            <div className="md:col-span-2">
              <Label>Content</Label>
              <Textarea value={form.body} onChange={(e) => set("body", e.target.value)}
                placeholder="Leave a blank line between paragraphs."
                className="mt-2 min-h-64 rounded-2xl" />
            </div>
            {field("seo_title", "SEO title", { placeholder: "Defaults to the article title" })}
            <div>
              <Label>SEO description</Label>
              <Textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)}
                placeholder="Defaults to the excerpt" className="mt-2 rounded-2xl" />
              <p className={`mt-1 text-xs ${errors.seo_description ? "text-destructive" : "text-muted-foreground"}`}>
                {errors.seo_description ?? `${form.seo_description.length}/160`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-full" disabled={busy}>Publish</Button>
            <Button type="button" variant="outline" className="rounded-full" disabled={busy} onClick={() => save(false)}>
              Save as draft
            </Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["active", "archived"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full border border-hairline px-4 py-2 text-xs font-semibold capitalize ${tab === t ? "bg-navy text-navy-foreground border-navy" : ""}`}>
              {t}
            </button>
          ))}
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles"
          className="max-w-xs rounded-full" />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading articles…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Couldn't load articles. Refresh to try again.</p>
      ) : visible.length === 0 ? (
        <div className="soft-card p-8 text-sm text-muted-foreground">
          {tab === "archived" ? "No archived articles." : q ? "No articles match your search." : "No articles yet. Click “New article” to write one."}
        </div>
      ) : (
        <ul className="soft-card divide-y divide-hairline">
          {visible.map((a) => {
            const st = statusOf(a);
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="eyebrow">{a.category}{a.featured ? " · Featured" : ""}</p>
                  <p className="mt-1 font-serif text-base font-bold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.author || "No author"} · /insights/{a.slug}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-hairline px-3 py-1 text-[11px]">{st}</span>
                  {!a.archived && (
                    <>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(a)}>Edit</Button>
                      <Button variant="outline" size="sm" className="rounded-full"
                        onClick={() => patch(a, a.published ? { published: false } : { published: true, published_at: a.published_at ?? new Date().toISOString() }, a.published ? "Unpublished" : "Published")}>
                        {a.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full"
                        onClick={() => confirm(`Archive "${a.title}"? It will be hidden from the website.`) && patch(a, { archived: true }, "Archived")}>
                        Archive
                      </Button>
                    </>
                  )}
                  {a.archived && (
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => patch(a, { archived: false }, "Restored")}>Restore</Button>
                  )}
                  <Button variant="destructive" size="sm" className="rounded-full" onClick={() => remove(a)}>Delete</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
