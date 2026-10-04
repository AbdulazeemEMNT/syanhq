DROP POLICY IF EXISTS cms_brands_staff_write ON public.cms_brands;
CREATE POLICY cms_brands_admin_write ON public.cms_brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS cms_pricing_addons_staff_write ON public.cms_pricing_addons;
CREATE POLICY cms_pricing_addons_admin_write ON public.cms_pricing_addons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS cms_pricing_bouquets_staff_write ON public.cms_pricing_bouquets;
CREATE POLICY cms_pricing_bouquets_admin_write ON public.cms_pricing_bouquets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.unread_message_count() FROM PUBLIC, anon;