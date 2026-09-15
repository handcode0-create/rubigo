create or replace function public.admin_list_profiles()
returns setof jsonb
language sql
security definer
set search_path = public, auth
as $$
  select jsonb_build_object(
    'id', p.id,
    'role', p.role,
    'name', p.name,
    'phone', p.phone,
    'city', p.city,
    'initials', p.initials,
    'is_active', p.is_active,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'merchant_local_id', p.merchant_local_id,
    'email', u.email
  )
  from public.profiles p
  left join auth.users u
    on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

revoke all on function public.admin_list_profiles() from public;

grant execute
on function public.admin_list_profiles()
to authenticated;