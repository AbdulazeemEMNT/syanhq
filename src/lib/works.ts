export type WorkMetric = { label: string; value: string };

export type PublicWork = {
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
  metrics: WorkMetric[];
  featured: boolean;
  sort_order: number;
  coverUrl: string | null;
};

export const WORK_COVER_BUCKET = "work-covers";

export function parseMetrics(raw: unknown): WorkMetric[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is WorkMetric => !!m && typeof m === "object" && "label" in m && "value" in m)
    .map((m) => ({ label: String(m.label), value: String(m.value) }));
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
