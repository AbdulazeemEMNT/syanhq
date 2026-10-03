import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicCareer = {
  id: string;
  slug: string;
  title: string;
  employment_type: string;
  location: string;
  department: string | null;
  detail: string;
  full_description: string | null;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  application_url: string | null;
  closing_date: string | null;
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
  "id,slug,title,employment_type,location,department,detail,full_description,responsibilities,requirements,benefits,application_url,closing_date";

const today = () => new Date().toISOString().slice(0, 10);

export async function fetchOpenCareers(): Promise<PublicCareer[]> {
  const { data, error } = await publicClient()
    .from("cms_careers")
    .select(COLUMNS)
    .eq("published", true)
    .eq("archived", false)
    .or(`closing_date.is.null,closing_date.gte.${today()}`)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicCareer[];
}

export async function fetchOpenCareer(slug: string): Promise<PublicCareer | null> {
  const { data, error } = await publicClient()
    .from("cms_careers")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .eq("archived", false)
    .or(`closing_date.is.null,closing_date.gte.${today()}`)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PublicCareer | null) ?? null;
}
