-- roles
CREATE TYPE public.app_role AS ENUM ('admin','analyst','viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- projects
CREATE TABLE public.intelligence_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  description TEXT,
  markets TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligence_projects TO authenticated;
GRANT ALL ON public.intelligence_projects TO service_role;
ALTER TABLE public.intelligence_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_select_staff" ON public.intelligence_projects FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "projects_write_admin" ON public.intelligence_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.intelligence_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.intelligence_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'broad',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_keywords TO authenticated;
GRANT ALL ON public.project_keywords TO service_role;
ALTER TABLE public.project_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keywords_select_staff" ON public.project_keywords FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "keywords_write" ON public.project_keywords FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'));

CREATE TABLE public.project_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.intelligence_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_competitors TO authenticated;
GRANT ALL ON public.project_competitors TO service_role;
ALTER TABLE public.project_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitors_select_staff" ON public.project_competitors FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "competitors_write" ON public.project_competitors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'));

CREATE TABLE public.project_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.intelligence_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'news',
  endpoint TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_sources TO authenticated;
GRANT ALL ON public.project_sources TO service_role;
ALTER TABLE public.project_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources_select_staff" ON public.project_sources FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "sources_write" ON public.project_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'));

CREATE TABLE public.project_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.intelligence_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  what_happened TEXT,
  why_it_matters TEXT,
  what_changed TEXT,
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_alerts TO authenticated;
GRANT ALL ON public.project_alerts TO service_role;
ALTER TABLE public.project_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select_staff" ON public.project_alerts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "alerts_write" ON public.project_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'));

CREATE TABLE public.intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.intelligence_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'weekly',
  period_start DATE,
  period_end DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  summary TEXT,
  file_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligence_reports TO authenticated;
GRANT ALL ON public.intelligence_reports TO service_role;
ALTER TABLE public.intelligence_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_staff" ON public.intelligence_reports FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "reports_write" ON public.intelligence_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'analyst'));

CREATE TABLE public.project_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.intelligence_projects(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'google/gemini-3.7-flash',
  tone TEXT NOT NULL DEFAULT 'executive',
  instructions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_ai_settings TO authenticated;
GRANT ALL ON public.project_ai_settings TO service_role;
ALTER TABLE public.project_ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_settings_select_staff" ON public.project_ai_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "ai_settings_write_admin" ON public.project_ai_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ai_settings_updated BEFORE UPDATE ON public.project_ai_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'not_connected',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrations_select_staff" ON public.integrations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "integrations_write_admin" ON public.integrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.integrations (provider, category, status, notes) VALUES
  ('Media monitoring provider','media','not_connected','Ingestion interface ready. Awaiting API credentials.'),
  ('Social listening provider','social','not_connected','Ingestion interface ready. Awaiting API credentials.'),
  ('AI visibility provider','ai_visibility','not_connected','LLM discovery tracking interface ready.'),
  ('Broadcast monitoring provider','broadcast','not_connected','Awaiting partner agreement.');