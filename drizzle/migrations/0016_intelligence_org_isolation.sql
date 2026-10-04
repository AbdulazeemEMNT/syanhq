CREATE TABLE IF NOT EXISTS public.intelligence_workspace_members (
  workspace_id uuid NOT NULL REFERENCES public.intelligence_workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
GRANT SELECT ON public.intelligence_workspace_members TO authenticated;
GRANT ALL ON public.intelligence_workspace_members TO service_role;
ALTER TABLE public.intelligence_workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY members_select_self ON public.intelligence_workspace_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());

INSERT INTO public.intelligence_workspace_members (workspace_id, user_id, role)
SELECT id, owner_id, 'owner' FROM public.intelligence_workspaces
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.intelligence_workspace_members
                 WHERE workspace_id = _workspace_id AND user_id = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_workspace_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.intelligence_workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_workspace_owner_member ON public.intelligence_workspaces;
CREATE TRIGGER trg_workspace_owner_member AFTER INSERT ON public.intelligence_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.add_workspace_owner();

-- Workspaces: members read; only the owner edits or deletes.
DROP POLICY IF EXISTS ws_select_own ON public.intelligence_workspaces;
CREATE POLICY ws_select_member ON public.intelligence_workspaces
  FOR SELECT TO authenticated USING (public.is_workspace_member(id, auth.uid()));

-- Mentions: only members of that organisation, or SYAN staff.
DROP POLICY IF EXISTS mentions_select_owner_or_staff ON public.intelligence_mentions;
CREATE POLICY mentions_select_member_or_staff ON public.intelligence_mentions
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()) OR public.is_staff(auth.uid()));

-- Website visitors never touch Intelligence data.
REVOKE ALL ON public.intelligence_workspaces, public.intelligence_mentions, public.intelligence_workspace_members,
  public.intelligence_projects, public.intelligence_reports, public.project_alerts, public.project_competitors,
  public.project_keywords, public.project_sources, public.project_ai_settings, public.integrations FROM anon;