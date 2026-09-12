-- RUBIGO — migration 0009 : pgcrypto vit dans le schéma "extensions"
-- sur ce projet, pas "public". Toute fonction utilisant crypt()/gen_salt()
-- sans l'avoir dans son search_path échoue avec :
--   ERROR 42883: function crypt(text, text) does not exist
--
-- generate_order_pin() (migration 0006) avait ce problème : le trigger
-- AFTER INSERT sur orders levait une exception, ce qui annule TOUTE la
-- création de commande (INSERT orders + order_items) — donc une commande
-- pouvait échouer silencieusement à la création selon la configuration.
--
-- On corrige en ajoutant "extensions" au search_path de chaque fonction
-- concernée, plutôt qu'en qualifiant chaque appel individuellement.
--
-- IDEMPOTENT. À exécuter dans Supabase Dashboard > SQL Editor.

create or replace function public.generate_order_pin()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_pin text;
begin
  v_pin := lpad(floor(random() * 10000)::text, 4, '0');
  insert into public.order_pins (order_id, pin, pin_hash)
  values (new.id, v_pin, crypt(v_pin, gen_salt('bf')))
  on conflict (order_id) do nothing;
  return new;
end;
$$;

create or replace function public.confirm_delivery(p_order_id uuid, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders%rowtype;
  v_pin_row public.order_pins%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;

  if v_order.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_order.driver_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if v_order.status not in ('picked_up', 'delivering') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  if v_order.delivery_confirmed then
    return jsonb_build_object('ok', false, 'error', 'already_confirmed');
  end if;

  select * into v_pin_row from public.order_pins where order_id = p_order_id for update;

  if v_pin_row.order_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_pin');
  end if;

  if v_pin_row.attempts >= v_pin_row.max_attempts then
    return jsonb_build_object('ok', false, 'error', 'too_many_attempts');
  end if;

  if v_pin_row.pin_hash <> crypt(p_pin, v_pin_row.pin_hash) then
    update public.order_pins set attempts = attempts + 1 where order_id = p_order_id;
    return jsonb_build_object(
      'ok', false,
      'error', 'invalid_pin',
      'attempts_left', v_pin_row.max_attempts - (v_pin_row.attempts + 1)
    );
  end if;

  update public.order_pins set confirmed = true where order_id = p_order_id;
  update public.orders
    set status = 'delivered',
        delivered_at = now(),
        delivery_confirmed = true,
        delivered_by = auth.uid()
    where id = p_order_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.confirm_delivery(uuid, text) to authenticated;
