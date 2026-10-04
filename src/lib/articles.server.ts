import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { WORK_COVER_BUCKET } from "./works";

export type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  author: string | null;
  tags: string[];
  readingTime: string | null;
  date: string;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  coverUrl: string | null;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const COLUMNS =
  "id,slug,title,category,excerpt,body,author,tags,reading_time,published_at,created_at,featured,seo_title,seo_description,cover_image_path";

type Row = {
  id: string; slug: string; title: string; category: string; excerpt: string | null;
  body: string | null; author: string | null; tags: string[]; reading_time: string | null;
  published_at: string | null; created_at: string; featured: boolean; seo_title: string | null;
  seo_description: string | null; cover_image_path: string | null;
};

async function shape(rows: Row[]): Promise<PublicArticle[]> {
  const sb = publicClient();
  const paths = rows.map((r) => r.cover_image_path).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from(WORK_COVER_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    data?.forEach((d) => d.path && d.signedUrl && urls.set(d.path, d.signedUrl));
  }
  return rows.map((r) => ({
    id: r.id, slug: r.slug, title: r.title, category: r.category, excerpt: r.excerpt,
    body: r.body, author: r.author, tags: r.tags ?? [], readingTime: r.reading_time,
    date: r.published_at ?? r.created_at, featured: r.featured, seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    coverUrl: r.cover_image_path ? (urls.get(r.cover_image_path) ?? null) : null,
  }));
}

function base() {
  const nowIso = new Date().toISOString();
  return publicClient()
    .from("cms_articles")
    .select(COLUMNS)
    .eq("published", true)
    .eq("archived", false)
    .or(`published_at.is.null,published_at.lte.${nowIso}`);
}

export async function fetchPublishedArticles(): Promise<PublicArticle[]> {
  const { data, error } = await base()
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return shape((data ?? []) as Row[]);
}

export async function fetchPublishedArticle(slug: string): Promise<PublicArticle | null> {
  const { data, error } = await base().eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return (await shape([data as Row]))[0] ?? null;
}
