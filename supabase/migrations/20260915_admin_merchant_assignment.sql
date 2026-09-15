create or replace function public.admin_assign_merchant(
  p_profile_id uuid,
  p_merchant_local_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_existing_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Administrateur non authentifié';
  end if;

  if not public.is_admin() then
    raise exception 'Accès administrateur refusé';
  end if;

  if p_profile_id is null then
    raise exception 'Profil commerçant invalide';
  end if;

  if p_merchant_local_id is null
     or trim(p_merchant_local_id) = '' then
    raise exception 'Commerce invalide';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = p_profile_id
  for update;

  if not found then
    raise exception 'Profil introuvable';
  end if;

  if v_profile.role <> 'merchant'::public.user_role then
    raise exception 'Le profil doit être un commerçant validé';
  end if;

  select id
  into v_existing_id
  from public.profiles
  where merchant_local_id = trim(p_merchant_local_id)
    and id <> p_profile_id
    and role = 'merchant'::public.user_role
    and is_active = true
  limit 1;

  if v_existing_id is not null then
    raise exception 'Ce commerce est déjà associé à un autre commerçant';
  end if;

  update public.profiles
  set
    merchant_local_id = trim(p_merchant_local_id),
    updated_at = now()
  where id = p_profile_id;

  return jsonb_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'merchant_local_id', trim(p_merchant_local_id)
  );
end;
$$;

revoke all
on function public.admin_assign_merchant(uuid, text)
from public;

grant execute
on function public.admin_assign_merchant(uuid, text)
to authenticated;