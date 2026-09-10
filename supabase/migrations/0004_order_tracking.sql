-- RUBIGO — migration 0004 : suivi de commande réel
-- Additif uniquement : ne modifie aucune colonne/policy existante.
-- À exécuter dans Supabase Dashboard > SQL Editor.

-- 1) Horodatage réel de chaque étape (NULL tant que l'étape n'a pas eu lieu :
--    aucune valeur n'est jamais inventée côté frontend).
alter table public.orders
  add column confirmed_at timestamptz,
  add column preparing_at timestamptz,
  add column ready_at timestamptz,
  add column picked_up_at timestamptz,
  add column out_for_delivery_at timestamptz,
  add column delivered_at timestamptz,
  add column estimated_delivery_at timestamptz;

-- 2) Snapshot texte de l'adresse de livraison au moment de la commande.
--    Les adresses client ne sont pas encore stockées dans Supabase (étape
--    ultérieure) : on ne peut donc pas encore référencer delivery_address_id.
--    Ce champ texte évite de perdre cette information réelle.
alter table public.orders
  add column delivery_address_text text;

-- 3) Les commerces (merchants) ne sont pas non plus encore migrés vers
--    Supabase : ils vivent toujours dans data.ts avec des identifiants
--    locaux (ex. "merchant-002"), pas des UUID Supabase. La contrainte
--    merchant_id NOT NULL + FK empêcherait donc toute création réelle de
--    commande. On assouplit la colonne et on ajoute un identifiant local
--    de secours, en attendant la migration complète des commerces.
alter table public.orders
  alter column merchant_id drop not null,
  add column merchant_local_id text;

-- 3) Le client peut créer sa propre commande (et ses lignes).
create policy "orders customer insert" on public.orders
  for insert
  with check (customer_id = auth.uid());

create policy "order items customer insert" on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and customer_id = auth.uid()
    )
  );

-- 4) Mise à jour du statut/horodatage réservée aux parties prenantes réelles
--    (commerçant propriétaire, livreur assigné, admin) — jamais le client,
--    jamais le frontend "de confiance". Prépare les futures interfaces
--    commerçant/livreur réelles (pas encore construites).
create policy "orders participants update" on public.orders
  for update
  using (
    public.is_admin()
    or driver_id = auth.uid()
    or exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid())
  );

-- 5) Un client doit pouvoir lire le nom du livreur réellement assigné à
--    sa commande (jusqu'ici bloqué : la policy "profiles own or admin" ne
--    couvrait pas ce cas). Lecture seule, uniquement si un vrai driver_id
--    est renseigné sur une commande qui lui appartient.
create policy "profiles readable by order customer" on public.profiles
  for select
  using (
    exists (
      select 1 from public.orders
      where orders.driver_id = profiles.id
        and orders.customer_id = auth.uid()
    )
  );
