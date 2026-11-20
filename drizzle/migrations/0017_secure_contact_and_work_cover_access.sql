DROP POLICY IF EXISTS contact_messages_public_insert ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;

DROP POLICY IF EXISTS "work covers read" ON storage.objects;
CREATE POLICY "work covers editor read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'work-covers'
    AND (
      public.has_permission(auth.uid(), 'works.manage')
      OR public.has_permission(auth.uid(), 'articles.manage')
    )
  );