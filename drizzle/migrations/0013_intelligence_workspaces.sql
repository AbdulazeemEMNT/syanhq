CREATE TABLE public.intelligence_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_name text NOT NULL CHECK (char_length(organisation_name) BETWEEN 1 AND 160),
  website text CHECK (website IS NULL OR char_length(website) <= 300),
  keywords text[] NOT NULL DEFAULT '{}',
  competitors text[] NOT NULL DEFAULT '{}',
  priorities text[] NOT NULL DEFAULT '{}' CHECK (priorities <@ ARRAY['reputation','media_coverage','sentiment','competitors','ai_visibility']::text[]),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligence_workspaces TO authenticated;
GRANT ALL ON public.intelligence_workspaces TO service_role;
ALTER TABLE public.intelligence_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_select_own" ON public.intelligence_workspaces FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "ws_insert_own" ON public.intelligence_workspaces FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ws_update_own" ON public.intelligence_workspaces FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ws_delete_own" ON public.intelligence_workspaces FOR DELETE TO authenticated USING (owner_id = auth.uid());