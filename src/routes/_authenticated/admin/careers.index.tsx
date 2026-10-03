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

export const Route = createFileRoute("/_authenticated/admin/careers/")({
  component: CareersAdmin,
});

type CareerRow = {
  id: string;
  slug: string;
  title: string;
  employment_type: string;
  location: string;
  detail: string;
  responsibilities: string[];
  requirements: string[];
  published: boolean;
};

const emptyForm = {
  title: "",
  employment_type: "Full-time",
  location: "Lagos, Nigeria",
  detail: "",
  responsibilities: "",
  requirements: "",
  published: true,
};

function toList(value: string) {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function CareersAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["cms_careers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_careers")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CareerRow[];
    },
  });

  useEffect(() => {
    if (!editingId) setForm(emptyForm);
  }, [editingId]);

  function startEdit(c: CareerRow) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      employment_type: c.employment_type,
      location: c.location,
      detail: c.detail,
      responsibilities: c.responsibilities.join("\n"),
      requirements: c.requirements.join("\n"),
      published: c.published,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      employment_type: form.employment_type,
      location: form.location,
      detail: form.detail,
      responsibilities: toList(form.responsibilities),
      requirements: toList(form.requirements),
      published: form.published,
    };
    const { error } = editingId
      ? await supabase.from("cms_careers").update(payload).eq("id", editingId)
      : await supabase.from("cms_careers").insert({ ...payload, slug: slugify(form.title) });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Role updated" : "Role added");
    setEditingId(null);
    setForm(emptyForm);
    qc.invalidateQueries({ queryKey: ["cms_careers"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("cms_careers").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    qc.invalidateQueries({ queryKey: ["cms_careers"] });
  }

  async function togglePublished(c: CareerRow) {
    const { error } = await supabase
      .from("cms_careers")
      .update({ published: !c.published })
      .eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["cms_careers"] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Careers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open roles shown on the public Careers page.
        </p>
      </div>

      <form onSubmit={save} className="soft-card space-y-5 p-8">
        <h2 className="font-serif text-xl font-bold">{editingId ? "Edit role" : "Post a role"}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <Label>Role title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 rounded-full"
              required
            />
          </div>
          <div>
            <Label>Employment type</Label>
            <Input
              value={form.employment_type}
              onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
              className="mt-2 rounded-full"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-2 rounded-full"
            />
          </div>
          <div className="md:col-span-3">
            <Label>Role detail</Label>
            <Textarea
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className="mt-2 rounded-2xl"
            />
          </div>
          <div>
            <Label>Responsibilities (one per line)</Label>
            <Textarea
              value={form.responsibilities}
              onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              className="mt-2 min-h-32 rounded-2xl"
            />
          </div>
          <div>
            <Label>Requirements (one per line)</Label>
            <Textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="mt-2 min-h-32 rounded-2xl"
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
            {editingId ? "Save changes" : "Add role"}
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
      ) : roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roles posted yet.</p>
      ) : (
        <ul className="divide-y divide-hairline">
          {roles.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="eyebrow">{c.employment_type}</p>
                <p className="mt-1 font-serif text-base font-bold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(c)}
                  className="rounded-full border border-hairline px-3 py-1 text-xs"
                >
                  {c.published ? "published" : "draft"}
                </button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(c)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={() => remove(c.id)}>
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
