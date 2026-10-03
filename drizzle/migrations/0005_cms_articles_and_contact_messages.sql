CREATE TABLE public.cms_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Insight',
  excerpt text,
  body text,
  reading_time text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organisation text,
  email text NOT NULL,
  interest text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_articles TO authenticated;
GRANT SELECT ON public.cms_articles TO anon;
GRANT ALL ON public.cms_articles TO service_role;
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_articles_public_read" ON public.cms_articles FOR SELECT TO anon, authenticated USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "cms_articles_staff_write" ON public.cms_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'));
CREATE TRIGGER trg_cms_articles_updated BEFORE UPDATE ON public.cms_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_messages_staff_read" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "contact_messages_staff_update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));