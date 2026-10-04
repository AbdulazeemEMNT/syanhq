ALTER TABLE public.intelligence_mentions ADD COLUMN IF NOT EXISTS subject text;
COMMENT ON COLUMN public.intelligence_mentions.subject IS 'NULL = coverage about the organisation; otherwise the competitor name this coverage is about.';
CREATE INDEX IF NOT EXISTS intelligence_mentions_ws_subject_idx ON public.intelligence_mentions (workspace_id, subject);