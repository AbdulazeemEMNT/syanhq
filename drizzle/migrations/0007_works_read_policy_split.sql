DROP POLICY IF EXISTS cms_case_studies_public_read ON public.cms_case_studies;
CREATE POLICY cms_case_studies_anon_read ON public.cms_case_studies FOR SELECT TO anon
  USING (published AND NOT archived);
CREATE POLICY cms_case_studies_auth_read ON public.cms_case_studies FOR SELECT TO authenticated
  USING ((published AND NOT archived) OR public.is_staff(auth.uid()));