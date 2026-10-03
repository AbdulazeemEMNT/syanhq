ALTER TABLE public.cms_careers
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS benefits text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS application_url text,
  ADD COLUMN IF NOT EXISTS closing_date date,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS cms_careers_slug_key ON public.cms_careers(slug);
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='cms_careers' LOOP
    EXECUTE format('DROP POLICY %I ON public.cms_careers', p.policyname);
  END LOOP; END $$;
GRANT SELECT ON public.cms_careers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_careers TO authenticated;
CREATE POLICY cms_careers_anon_read ON public.cms_careers FOR SELECT TO anon
  USING (published AND NOT archived);
CREATE POLICY cms_careers_auth_read ON public.cms_careers FOR SELECT TO authenticated
  USING ((published AND NOT archived) OR public.is_staff(auth.uid()));
CREATE POLICY cms_careers_admin_write ON public.cms_careers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));