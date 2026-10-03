ALTER TABLE public.cms_case_studies
  ADD COLUMN IF NOT EXISTS cover_image_path text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS cms_case_studies_slug_key ON public.cms_case_studies(slug);

DROP POLICY IF EXISTS cms_case_studies_public_read ON public.cms_case_studies;
DROP POLICY IF EXISTS cms_case_studies_staff_write ON public.cms_case_studies;
CREATE POLICY cms_case_studies_public_read ON public.cms_case_studies FOR SELECT TO anon, authenticated
  USING ((published AND NOT archived) OR public.is_staff(auth.uid()));
CREATE POLICY cms_case_studies_admin_write ON public.cms_case_studies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "work covers read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'work-covers');
CREATE POLICY "work covers admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "work covers admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "work covers admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));