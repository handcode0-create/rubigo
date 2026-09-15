create or replace function public.merchant_update_order_status(
  p_order_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile public.profiles%rowtype;
  v_order public.orders%rowtype;
  v_new_status public.order_status;
  v_timestamp_column text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  v_new_status := p_status::public.order_status;

  select *
  into v_profile
  from public.profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'Profil commerçant introuvable';
  end if;

  if v_profile.role <> 'merchant'::public.user_role then
    raise exception 'Ce compte n''est pas un commerçant';
  end if;

  if v_profile.merchant_local_id is null then
    raise exception 'Ce compte n''est associé à aucun commerce';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Commande introuvable';
  end if;

  if v_order.merchant_local_id <> v_profile.merchant_local_id then
    raise exception 'Cette commande appartient à un autre commerce';
  end if;

  if v_order.status = 'pending'::public.order_status
     and v_new_status not in (
       'accepted'::public.order_status,
       'merchant_rejected'::public.order_status
     ) then
    raise exception 'Transition invalide : pending -> %', p_status;
  end if;

  if v_order.status = 'accepted'::public.order_status
     and v_new_status <> 'preparing'::public.order_status then
    raise exception 'Transition invalide : accepted -> %', p_status;
  end if;

  if v_order.status = 'preparing'::public.order_status
     and v_new_status <> 'ready'::public.order_status then
    raise exception 'Transition invalide : preparing -> %', p_status;
  end if;

  v_timestamp_column := case v_new_status
    when 'accepted' then 'confirmed_at'
    when 'preparing' then 'preparing_at'
    when 'ready' then 'ready_at'
    else null
  end;

  update public.orders
  set
    status = v_new_status,
    confirmed_at = case
      when v_new_status = 'accepted'::public.order_status
        then coalesce(confirmed_at, now())
      else confirmed_at
    end,
    preparing_at = case
      when v_new_status = 'preparing'::public.order_status
        then coalesce(preparing_at, now())
      else preparing_at
    end,
    ready_at = case
      when v_new_status = 'ready'::public.order_status
        then coalesce(ready_at, now())
      else ready_at
    end
  where id = p_order_id;

  return jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', v_new_status::text,
    'merchant_local_id', v_profile.merchant_local_id
  );
end;
$$;

revoke all
on function public.merchant_update_order_status(uuid, text)
from public;

grant execute
on function public.merchant_update_order_status(uuid, text)
to authenticated;