import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/articles/")({
  component: ArticlesAdmin,
});

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  reading_time: string | null;
  published: boolean;
};

const emptyForm = {
  title: "",
  category: "Insight",
  excerpt: "",
  body: "",
  reading_time: "",
  published: true,
};

function ArticlesAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["cms_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ArticleRow[];
    },
  });

  useEffect(() => {
    if (!editingId) setForm(emptyForm);
  }, [editingId]);

  function startEdit(a: ArticleRow) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      category: a.category,
      excerpt: a.excerpt ?? "",
      body: a.body ?? "",
      reading_time: a.reading_time ?? "",
      published: a.published,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      category: form.category,
      excerpt: form.excerpt || null,
      body: form.body || null,
      reading_time: form.reading_time || null,
      published: form.published,
    };
    const { error } = editingId
      ? await supabase.from("cms_articles").update(payload).eq("id", editingId)
      : await supabase.from("cms_articles").insert({ ...payload, slug: slugify(form.title) });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Article updated" : "Article added");
    setEditingId(null);
    setForm(emptyForm);
    qc.invalidateQueries({ queryKey: ["cms_articles"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("cms_articles").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    qc.invalidateQueries({ queryKey: ["cms_articles"] });
  }

  async function togglePublished(a: ArticleRow) {
    const { error } = await supabase
      .from("cms_articles")
      .update({ published: !a.published })
      .eq("id", a.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["cms_articles"] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Articles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Editorial pieces for the Insights section of the site.
        </p>
      </div>

      <form onSubmit={save} className="soft-card space-y-5 p-8">
        <h2 className="font-serif text-xl font-bold">
          {editingId ? "Edit article" : "Write an article"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 rounded-full"
              required
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-2 rounded-full"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Excerpt</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="mt-2 rounded-2xl"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Body</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="mt-2 min-h-40 rounded-2xl"
            />
          </div>
          <div>
            <Label>Reading time</Label>
            <Input
              value={form.reading_time}
              onChange={(e) => setForm({ ...form, reading_time: e.target.value })}
              placeholder="6 min read"
              className="mt-2 rounded-full"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>
        <div className="flex gap-3">
          <Button type="submit" className="rounded-full">
            {editingId ? "Save changes" : "Add article"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles yet.</p>
      ) : (
        <ul className="divide-y divide-hairline">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="eyebrow">{a.category}</p>
                <p className="mt-1 font-serif text-base font-bold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.excerpt || a.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(a)}
                  className="rounded-full border border-hairline px-3 py-1 text-xs"
                >
                  {a.published ? "published" : "draft"}
                </button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(a)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={() => remove(a.id)}>
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
