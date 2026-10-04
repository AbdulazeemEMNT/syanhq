-- Staff & permissions
CREATE TABLE IF NOT EXISTS public.staff_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role_preset text NOT NULL DEFAULT 'custom',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.staff_members(user_id) ON DELETE CASCADE,
  permission text NOT NULL CHECK (permission IN ('dashboard.view','works.manage','articles.manage','careers.manage','messages.manage','settings.manage')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);
GRANT SELECT ON public.staff_members TO authenticated;
GRANT SELECT ON public.staff_permissions TO authenticated;
GRANT ALL ON public.staff_members TO service_role;
GRANT ALL ON public.staff_permissions TO service_role;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER staff_members_updated_at BEFORE UPDATE ON public.staff_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Owners (admin role) hold every permission; other staff need an active membership + grant.
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1 FROM public.staff_permissions p
      JOIN public.staff_members m ON m.user_id = p.user_id
      WHERE p.user_id = _user_id AND m.status = 'active' AND p.permission = _permission
    )
$$;

CREATE OR REPLACE FUNCTION public.my_permissions()
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.has_role(auth.uid(), 'admin')
    THEN ARRAY['dashboard.view','works.manage','articles.manage','careers.manage','messages.manage','settings.manage']
    ELSE COALESCE((SELECT array_agg(p.permission ORDER BY p.permission) FROM public.staff_permissions p
      JOIN public.staff_members m ON m.user_id = p.user_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'), ARRAY[]::text[])
  END
$$;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.my_permissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_permissions() TO authenticated;

CREATE POLICY staff_members_read ON public.staff_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'settings.manage'));
CREATE POLICY staff_permissions_read ON public.staff_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'settings.manage'));

-- Articles: richer fields
ALTER TABLE public.cms_articles
  ADD COLUMN IF NOT EXISTS cover_image_path text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.cms_articles ALTER COLUMN published SET DEFAULT false;
DROP TRIGGER IF EXISTS cms_articles_updated_at ON public.cms_articles;
CREATE TRIGGER cms_articles_updated_at BEFORE UPDATE ON public.cms_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permission-based RLS for CMS content
DROP POLICY IF EXISTS cms_articles_public_read ON public.cms_articles;
DROP POLICY IF EXISTS cms_articles_staff_write ON public.cms_articles;
CREATE POLICY cms_articles_anon_read ON public.cms_articles FOR SELECT TO anon
  USING (published AND NOT archived AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY cms_articles_auth_read ON public.cms_articles FOR SELECT TO authenticated
  USING ((published AND NOT archived AND (published_at IS NULL OR published_at <= now())) OR public.has_permission(auth.uid(), 'articles.manage') OR public.has_permission(auth.uid(), 'dashboard.view'));
CREATE POLICY cms_articles_write ON public.cms_articles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'articles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'articles.manage'));

DROP POLICY IF EXISTS cms_case_studies_auth_read ON public.cms_case_studies;
DROP POLICY IF EXISTS cms_case_studies_admin_write ON public.cms_case_studies;
CREATE POLICY cms_case_studies_auth_read ON public.cms_case_studies FOR SELECT TO authenticated
  USING ((published AND NOT archived) OR public.has_permission(auth.uid(), 'works.manage') OR public.has_permission(auth.uid(), 'dashboard.view'));
CREATE POLICY cms_case_studies_write ON public.cms_case_studies FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'works.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'works.manage'));

DROP POLICY IF EXISTS cms_careers_auth_read ON public.cms_careers;
DROP POLICY IF EXISTS cms_careers_admin_write ON public.cms_careers;
CREATE POLICY cms_careers_auth_read ON public.cms_careers FOR SELECT TO authenticated
  USING ((published AND NOT archived) OR public.has_permission(auth.uid(), 'careers.manage') OR public.has_permission(auth.uid(), 'dashboard.view'));
CREATE POLICY cms_careers_write ON public.cms_careers FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'careers.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'careers.manage'));

DROP POLICY IF EXISTS contact_messages_staff_read ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_staff_update ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_admin_delete ON public.contact_messages;
CREATE POLICY contact_messages_read ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'messages.manage'));
CREATE POLICY contact_messages_update ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'messages.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'messages.manage'));
CREATE POLICY contact_messages_delete ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'messages.manage'));

-- Unread count for the dashboard without exposing message contents
CREATE OR REPLACE FUNCTION public.unread_message_count()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.has_permission(auth.uid(), 'dashboard.view') OR public.has_permission(auth.uid(), 'messages.manage')
    THEN (SELECT count(*)::int FROM public.contact_messages WHERE status = 'new') ELSE 0 END
$$;
REVOKE EXECUTE ON FUNCTION public.unread_message_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unread_message_count() TO authenticated;

-- Cover images bucket: works or articles editors may write
DROP POLICY IF EXISTS "work covers admin insert" ON storage.objects;
DROP POLICY IF EXISTS "work covers admin update" ON storage.objects;
DROP POLICY IF EXISTS "work covers admin delete" ON storage.objects;
CREATE POLICY "work covers editor insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-covers' AND (public.has_permission(auth.uid(), 'works.manage') OR public.has_permission(auth.uid(), 'articles.manage')));
CREATE POLICY "work covers editor update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'work-covers' AND (public.has_permission(auth.uid(), 'works.manage') OR public.has_permission(auth.uid(), 'articles.manage')));
CREATE POLICY "work covers editor delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'work-covers' AND (public.has_permission(auth.uid(), 'works.manage') OR public.has_permission(auth.uid(), 'articles.manage')));

-- Move the existing Insights articles into the CMS
INSERT INTO public.cms_articles (slug, title, category, excerpt, body, reading_time, published, published_at, author, featured) VALUES
('ai-search-is-the-new-front-page','AI search is the new front page','AI Visibility','When buyers ask a model instead of a search box, citation becomes the new ranking. Here is how brands earn it.',
E'For two decades, discovery meant ten blue links. That era is closing. A growing share of commercial questions now ends inside an AI answer, where a single synthesised response replaces the page of options.\n\nThe mechanics are unfamiliar but the logic is old: models cite sources they can verify. Encyclopaedic references, national press coverage, structured entity data and consistent naming all raise the probability that your organisation is the one quoted.\n\nThis is why we treat public relations, search and entity management as one discipline rather than three. Coverage creates the citable record; structure makes it machine-legible; measurement tells you whether the models actually picked it up.\n\nThe practical test is simple. Ask the models what they say about you today, record it, and treat the gap between that answer and your intended narrative as a strategic problem — because it is.',
'6 min read', true, '2026-07-14', 'SYAN Media', true),
('the-first-six-hours-of-a-crisis','The first six hours of a crisis','Reputation','Most reputational damage is decided before the first statement is drafted. A field guide to the opening window.',
E'Crises are rarely lost on the facts. They are lost on tempo — the hours between the first signal and the first credible response, during which other people write your story for you.\n\nThe opening window has three jobs: establish what is verifiably true, establish who speaks, and establish the cadence of updates. Everything else can wait.\n\nOrganisations that survive scrutiny well tend to have rehearsed this. They have a named decision-maker, a pre-cleared holding statement, and a monitoring feed that tells them where the conversation is actually happening.\n\nThat last point is why detection matters as much as drafting. A spike you notice on day three is a different, more expensive problem than one you noticed in hour one.',
'5 min read', true, '2026-06-02', 'SYAN Media', false),
('share-of-voice-is-not-vanity','Share of voice is not vanity — when you measure it properly','Intelligence','Mention counts flatter. Weighted, competitor-relative share of voice tells you whether you are actually winning the conversation.',
E'Raw mention volume is the easiest number to grow and the least useful to own. Ten thousand low-authority mentions can coexist with total invisibility in the outlets your buyers, regulators and investors actually read.\n\nWeighted share of voice fixes this by scoring mentions against outlet authority, audience reach and sentiment, then expressing the result relative to a defined competitive set.\n\nThe competitive set is the discipline. Choose three named competitors, hold them constant, and track the delta over quarters rather than weeks.\n\nDone properly, share of voice stops being a slide in a monthly report and becomes a decision input: where to push, where to defend, and where the market is being conceded quietly.',
'7 min read', true, '2026-05-09', 'SYAN Media', false),
('storytelling-that-sells','Storytelling that sells: from coverage to commercial result','Strategy','Coverage is a means, not an outcome. The bridge between a headline and a signed customer is engineered, not hoped for.',
E'Too many agencies focus on vanity mentions that never bring in a single customer or investor. The clipping arrives, the team celebrates, and the pipeline does not move.\n\nThe bridge is deliberate: coverage lands, search captures the resulting interest, the site converts it, and retention keeps it. Break any link and the value leaks.\n\nIn practice this means planning the landing page before the press release, the retargeting audience before the launch, and the follow-up sequence before the campaign closes.\n\nNarrative engineered, authority institutionalised — and revenue attributable.',
'5 min read', true, '2026-03-21', 'SYAN Media', false)
ON CONFLICT (slug) DO NOTHING;