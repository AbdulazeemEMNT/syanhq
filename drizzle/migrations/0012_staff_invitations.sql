CREATE TABLE public.staff_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  role_preset text NOT NULL DEFAULT 'custom',
  permissions text[] NOT NULL DEFAULT '{}',
  invited_by uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '14 days',
  accepted_at timestamptz,
  user_id uuid,
  CONSTRAINT staff_invitations_perms_valid CHECK (permissions <@ ARRAY['dashboard.view','works.manage','articles.manage','careers.manage','messages.manage','settings.manage']::text[])
);
CREATE UNIQUE INDEX staff_invitations_one_pending ON public.staff_invitations (lower(email)) WHERE status = 'pending';
GRANT SELECT ON public.staff_invitations TO authenticated;
GRANT ALL ON public.staff_invitations TO service_role;
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_invitations_manager_read ON public.staff_invitations FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'settings.manage'));

-- Called by a signed-in user; grants access only if a pending, unexpired invitation
-- matches their verified email. Users cannot pass in their own role or permissions.
CREATE OR REPLACE FUNCTION public.accept_staff_invitation()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  em text;
  verified timestamptz;
  inv public.staff_invitations%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT lower(email), email_confirmed_at INTO em, verified FROM auth.users WHERE id = uid;
  IF em IS NULL OR verified IS NULL THEN RETURN false; END IF;

  UPDATE public.staff_invitations SET status = 'expired'
    WHERE status = 'pending' AND expires_at < now() AND lower(email) = em;

  SELECT * INTO inv FROM public.staff_invitations
    WHERE status = 'pending' AND lower(email) = em AND expires_at >= now()
    ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO public.staff_members (user_id, email, full_name, role_preset, status, invited_by)
  VALUES (uid, em, inv.full_name, inv.role_preset, 'active', inv.invited_by)
  ON CONFLICT (user_id) DO UPDATE SET role_preset = EXCLUDED.role_preset, status = 'active',
    full_name = COALESCE(EXCLUDED.full_name, public.staff_members.full_name);
  DELETE FROM public.staff_permissions WHERE user_id = uid;
  INSERT INTO public.staff_permissions (user_id, permission)
    SELECT uid, unnest(inv.permissions);
  UPDATE public.staff_invitations SET status = 'accepted', accepted_at = now(), user_id = uid WHERE id = inv.id;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.accept_staff_invitation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_staff_invitation() TO authenticated;

-- Owner bootstrap is no longer offered; nobody can self-claim admin.
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM authenticated;

-- Profiles: users may only edit their own name, never id/email.
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
REVOKE INSERT ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- Staff tables are read-only to clients; all writes go through checked server code.
REVOKE INSERT, UPDATE, DELETE ON public.staff_members, public.staff_permissions FROM authenticated, anon;
REVOKE ALL ON public.staff_invitations FROM anon;