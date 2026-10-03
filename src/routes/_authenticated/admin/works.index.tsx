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
  services: string[];
  published: boolean;
};

const emptyForm = {
  client: "",
  sector: "",
  headline: "",
  summary: "",
  services: "",
  published: true,
};

function WorksAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: works = [], isLoading } = useQuery({
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

  useEffect(() => {
    if (!editingId) setForm(emptyForm);
  }, [editingId]);

  function startEdit(w: WorkRow) {
    setEditingId(w.id);
    setForm({
      client: w.client,
      sector: w.sector,
      headline: w.headline,
      summary: w.summary,
      services: w.services.join(", "),
      published: w.published,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      client: form.client,
      sector: form.sector,
      headline: form.headline,
      summary: form.summary,
      services: form.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      published: form.published,
    };
    const { error } = editingId
      ? await supabase.from("cms_case_studies").update(payload).eq("id", editingId)
      : await supabase.from("cms_case_studies").insert({ ...payload, slug: slugify(form.client) });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Case study updated" : "Case study added");
    setEditingId(null);
    setForm(emptyForm);
    qc.invalidateQueries({ queryKey: ["cms_case_studies"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("cms_case_studies").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    qc.invalidateQueries({ queryKey: ["cms_case_studies"] });
  }

  async function togglePublished(w: WorkRow) {
    const { error } = await supabase
      .from("cms_case_studies")
      .update({ published: !w.published })
      .eq("id", w.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["cms_case_studies"] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Works</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Case studies shown on the public Our Work page. Drafts stay hidden until published.
        </p>
      </div>

      <form onSubmit={save} className="soft-card space-y-5 p-8">
        <h2 className="font-serif text-xl font-bold">
          {editingId ? "Edit case study" : "Add a case study"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Client</Label>
            <Input
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className="mt-2 rounded-full"
              required
            />
          </div>
          <div>
            <Label>Sector</Label>
            <Input
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="mt-2 rounded-full"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Headline</Label>
            <Input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="mt-2 rounded-full"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Summary</Label>
            <Textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="mt-2 rounded-2xl"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Services (comma-separated)</Label>
            <Input
              value={form.services}
              onChange={(e) => setForm({ ...form, services: e.target.value })}
              placeholder="Media Relations, Crisis Communications"
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
            {editingId ? "Save changes" : "Add case study"}
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
      ) : works.length === 0 ? (
        <p className="text-sm text-muted-foreground">No case studies yet.</p>
      ) : (
        <ul className="divide-y divide-hairline">
          {works.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="eyebrow">{w.sector || "—"}</p>
                <p className="mt-1 font-serif text-base font-bold">{w.client}</p>
                <p className="text-xs text-muted-foreground">{w.headline || w.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(w)}
                  className="rounded-full border border-hairline px-3 py-1 text-xs"
                >
                  {w.published ? "published" : "draft"}
                </button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(w)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={() => remove(w.id)}>
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
