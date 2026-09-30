create or replace function public.user_roles_write_admin(_email text, _role public.app_role)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _target uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    return false;
  end if;
  select id into _target from public.profiles where email = _email limit 1;
  if _target is null then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (_target, _role)
  on conflict (user_id, role) do nothing;
  return true;
end;
$$;
grant execute on function public.user_roles_write_admin(text, public.app_role) to authenticated;
revoke execute on function public.user_roles_write_admin(text, public.app_role) from anon;