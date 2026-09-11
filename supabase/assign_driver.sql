-- RUBIGO — affectation sécurisée d'une commande prête à un livreur disponible
-- À exécuter dans Supabase SQL Editor.

create or replace function public.get_available_delivery_drivers()
returns table (
  id uuid,
  name text,
  initials text,
  phone text,
  city text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_merchant_local_id text;
begin
  v_role := public.current_profile_role();
  v_merchant_local_id := public.current_merchant_local_id();

  if v_role is distinct from 'merchant' or v_merchant_local_id is null then
    raise exception 'Accès refusé : rôle commerçant requis';
  end if;

  return query
  select
    p.id,
    p.name,
    coalesce(p.initials, upper(left(coalesce(p.name, 'LI'), 2))),
    coalesce(p.phone, ''),
    coalesce(p.city, '')
  from public.profiles p
  where p.role = 'driver'
    and p.is_active = true
    and not exists (
      select 1
      from public.orders o
      where o.driver_id = p.id
        and o.status in ('driver_assigned', 'picked_up', 'delivering')
    )
  order by p.name asc;
end;
$$;

create or replace function public.assign_order_driver(
  p_order_id uuid,
  p_driver_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_merchant_local_id text;
  v_order_merchant_local_id text;
  v_order_status text;
  v_driver_id uuid;
begin
  v_role := public.current_profile_role();
  v_merchant_local_id := public.current_merchant_local_id();

  if v_role is distinct from 'merchant' or v_merchant_local_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  -- Verrouille la commande pour éviter une double affectation concurrente.
  select o.merchant_local_id, o.status
    into v_order_merchant_local_id, v_order_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  if v_order_merchant_local_id is distinct from v_merchant_local_id then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if v_order_status is distinct from 'ready' then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  -- Verrouille le profil du livreur pour éviter qu'il soit affecté
  -- simultanément à deux commandes.
  select p.id
    into v_driver_id
  from public.profiles p
  where p.id = p_driver_id
    and p.role = 'driver'
    and p.is_active = true
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'driver_not_found');
  end if;

  if exists (
    select 1
    from public.orders o
    where o.driver_id = p_driver_id
      and o.status in ('driver_assigned', 'picked_up', 'delivering')
  ) then
    return jsonb_build_object('ok', false, 'error', 'driver_busy');
  end if;

  update public.orders
  set
    driver_id = p_driver_id,
    status = 'driver_assigned',
    updated_at = now()
  where id = p_order_id
    and status = 'ready'
    and driver_id is null;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'already_assigned');
  end if;

  return jsonb_build_object(
    'ok', true,
    'order_id', p_order_id,
    'driver_id', p_driver_id,
    'status', 'driver_assigned'
  );
end;
$$;

grant execute on function public.get_available_delivery_drivers() to authenticated;
grant execute on function public.assign_order_driver(uuid, uuid) to authenticated;
