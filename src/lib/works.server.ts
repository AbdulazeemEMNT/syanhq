import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { parseMetrics, WORK_COVER_BUCKET, type PublicWork } from "./works";

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
  "id,slug,client,sector,headline,summary,challenge,brief,strategy,execution,outcome_narrative,testimonial,testimonial_author,engagement_period,approach,results,services,deliverables,metrics,featured,sort_order,cover_image_path";

type Row = Omit<PublicWork, "coverUrl" | "metrics"> & {
  metrics: unknown;
  cover_image_path: string | null;
};

async function withCovers(rows: Row[]): Promise<PublicWork[]> {
  const sb = publicClient();
  const paths = rows.map((r) => r.cover_image_path).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from(WORK_COVER_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    data?.forEach((d) => d.path && d.signedUrl && urls.set(d.path, d.signedUrl));
  }
  return rows.map(({ cover_image_path, metrics, ...r }) => ({
    ...r,
    metrics: parseMetrics(metrics),
    coverUrl: cover_image_path ? (urls.get(cover_image_path) ?? null) : null,
  }));
}

export async function fetchPublishedWorks(): Promise<PublicWork[]> {
  const { data, error } = await publicClient()
    .from("cms_case_studies")
    .select(COLUMNS)
    .eq("published", true)
    .eq("archived", false)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return withCovers((data ?? []) as unknown as Row[]);
}

export async function fetchPublishedWork(slug: string): Promise<PublicWork | null> {
  const { data, error } = await publicClient()
    .from("cms_case_studies")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .eq("archived", false)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return (await withCovers([data as unknown as Row]))[0] ?? null;
}
