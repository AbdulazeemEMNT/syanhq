CREATE TABLE public.intelligence_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.intelligence_workspaces(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  published_at timestamptz,
  title text,
  excerpt text,
  author text,
  sentiment text CHECK (sentiment IS NULL OR sentiment IN ('positive','neutral','negative')),
  topic text,
  reach bigint CHECK (reach IS NULL OR reach >= 0),
  relevance real CHECK (relevance IS NULL OR (relevance >= 0 AND relevance <= 1)),
  url text,
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, external_id)
);
CREATE INDEX intelligence_mentions_ws_date ON public.intelligence_mentions (workspace_id, published_at DESC);
GRANT SELECT ON public.intelligence_mentions TO authenticated;
GRANT ALL ON public.intelligence_mentions TO service_role;
ALTER TABLE public.intelligence_mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentions_select_owner_or_staff" ON public.intelligence_mentions FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.intelligence_workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));
COMMENT ON TABLE public.intelligence_mentions IS 'Mentions ingested only from connected monitoring sources (server-side, service role). Never seeded with sample data.';