import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRIORITIES = [
  { id: "reputation", label: "Reputation", hint: "Spot risks to how people see you, early." },
  { id: "media_coverage", label: "Media coverage", hint: "Track where and how you appear in the press." },
  { id: "sentiment", label: "Sentiment", hint: "Understand whether conversation is positive or negative." },
  { id: "competitors", label: "Competitors", hint: "See how you compare with others in your space." },
  { id: "ai_visibility", label: "AI visibility", hint: "Learn how AI assistants describe your organisation." },
] as const;

export type PriorityId = (typeof PRIORITIES)[number]["id"];

export function useMyWorkspace() {
  return useQuery({
    queryKey: ["intelligence-workspace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_workspaces")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Normalise "acme.com" / "https://www.acme.com/about" to "acme.com". */
export function domainFrom(website: string): string {
  const raw = website.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

const SUFFIXES = /\b(ltd|limited|plc|inc|llc|group|holdings|company|co|corp|corporation|nigeria|international)\b\.?/gi;

/** Simple suggestions from the organisation name and website — the user edits them freely. */
export function suggestKeywords(name: string, website: string): string[] {
  const out = new Set<string>();
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean) out.add(clean);
  const short = clean.replace(SUFFIXES, "").replace(/\s+/g, " ").trim();
  if (short && short.toLowerCase() !== clean.toLowerCase()) out.add(short);
  const words = short.split(" ").filter(Boolean);
  if (words.length > 1) {
    const acronym = words.map((w) => w[0]).join("").toUpperCase();
    if (acronym.length >= 2) out.add(acronym);
  }
  const domain = domainFrom(website);
  if (domain) {
    out.add(domain);
    const base = domain.split(".")[0];
    if (base && base.length > 2 && ![...out].some((k) => k.toLowerCase() === base)) out.add(base);
  }
  if (short) {
    out.add(`${short} CEO`);
    out.add(`${short} news`);
  }
  return [...out].slice(0, 8);
}
