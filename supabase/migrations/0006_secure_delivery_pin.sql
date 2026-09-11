-- RUBIGO — migration 0006 : livraison sécurisée par PIN + missions livreur
-- Additif uniquement, sauf la policy "orders participants update" qui est
-- explicitement remplacée (drop + create) pour combler une faille réelle :
-- un livreur pouvait jusqu'ici mettre status='delivered' par une simple
-- UPDATE directe, sans jamais passer par la vérification du PIN.
--
-- IDEMPOTENT : ce fichier peut être exécuté plusieurs fois sans erreur,
-- même si une partie a déjà été appliquée lors d'une tentative précédente.
-- À exécuter dans Supabase Dashboard > SQL Editor.

-- ==========================================================================
-- 1) TABLE DÉDIÉE AU PIN — jamais exposée au livreur
-- ==========================================================================
-- Le PIN vit dans sa propre table avec sa propre policy : le livreur n'a
-- AUCUN accès (ni select, ni update) à cette table, à aucun moment. Seule
-- la fonction sécurisée confirm_delivery() (SECURITY DEFINER, ci-dessous)
-- peut la lire/modifier, en plus du client propriétaire de la commande qui
-- peut voir SON code pour le communiquer oralement au livreur.
create table if not exists public.order_pins (
  order_id uuid primary key references public.orders(id) on delete cascade,
  pin text not null,
  pin_hash text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.order_pins enable row level security;

drop policy if exists "order pin customer read" on public.order_pins;
create policy "order pin customer read" on public.order_pins
  for select
  using (exists (select 1 from public.orders where id = order_id and customer_id = auth.uid()));

-- ==========================================================================
-- 2) COLONNES DE PREUVE DE LIVRAISON
-- ==========================================================================
alter table public.orders
  add column if not exists delivery_confirmed boolean not null default false,
  add column if not exists delivered_by uuid references public.profiles(id);

-- L'ancienne colonne orders.delivery_pin (créée avant cette migration) est
-- dépréciée : elle était lisible par le livreur via "orders participants
-- read" (faille). On ne l'utilise plus côté frontend à partir de maintenant.
-- Elle n'est pas supprimée pour ne rien casser rétroactivement sur les
-- commandes déjà créées, mais elle ne contient plus la vérité désormais.

-- ==========================================================================
-- 3) GÉNÉRATION DU PIN — jamais côté frontend
-- ==========================================================================
create or replace function public.generate_order_pin()
returns trigger
language plpgsql
security definer
set search_path = public
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

drop trigger if exists trg_generate_order_pin on public.orders;
create trigger trg_generate_order_pin
  after insert on public.orders
  for each row execute function public.generate_order_pin();

-- ==========================================================================
-- 4) CONFIRMATION DE LIVRAISON — opération atomique, backend uniquement
-- ==========================================================================
-- Le frontend ne fait jamais "status = delivered" lui-même. Il appelle
-- cette fonction, qui vérifie tout côté serveur : commande réelle, livreur
-- bien assigné (auth.uid() = driver_id), statut cohérent, PIN correct,
-- nombre de tentatives, puis effectue la mise à jour de façon atomique
-- (verrous FOR UPDATE) pour empêcher toute double-validation.
create or replace function public.confirm_delivery(p_order_id uuid, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
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

-- ==========================================================================
-- 5) MISSIONS LIVREUR RÉELLES
-- ==========================================================================
-- Un livreur (role='driver') peut voir les commandes prêtes et non encore
-- assignées : ce sont les "missions disponibles".
drop policy if exists "orders visible as available mission" on public.orders;
create policy "orders visible as available mission" on public.orders
  for select
  using (
    status = 'ready'
    and driver_id is null
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'driver')
  );

-- Acceptation atomique d'une mission : évite que deux livreurs acceptent la
-- même commande en même temps (verrou FOR UPDATE + vérification driver_id
-- toujours null au moment de l'écriture).
create or replace function public.accept_delivery_mission(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_is_driver boolean;
begin
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'driver')
    into v_is_driver;

  if not v_is_driver then
    return jsonb_build_object('ok', false, 'error', 'not_a_driver');
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if v_order.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_order.status <> 'ready' or v_order.driver_id is not null then
    return jsonb_build_object('ok', false, 'error', 'already_taken');
  end if;

  update public.orders
    set driver_id = auth.uid(), status = 'driver_assigned'
    where id = p_order_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.accept_delivery_mission(uuid) to authenticated;

-- ==========================================================================
-- 6) RESTRICTION DE LA MISE À JOUR DIRECTE — comble la faille "delivered"
-- ==========================================================================
-- Remplace la policy 0004 : mêmes conditions de lecture, mais AUCUNE partie
-- prenante (livreur, commerçant) ne peut passer une commande à 'delivered'
-- par une simple UPDATE — seule la fonction confirm_delivery() le peut
-- (elle s'exécute en SECURITY DEFINER, donc hors RLS, sans être bloquée
-- par cette policy).
drop policy if exists "orders participants update" on public.orders;

create policy "orders participants update" on public.orders
  for update
  using (
    public.is_admin()
    or driver_id = auth.uid()
    or exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid())
  )
  with check (
    public.is_admin()
    or (driver_id = auth.uid() and status <> 'delivered')
    or (
      exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid())
      and status <> 'delivered'
    )
  );
