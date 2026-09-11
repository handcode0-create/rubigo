-- RUBIGO — migration 0007 : espace commerçant réel
-- Additif uniquement : ne modifie aucune colonne/policy existante des
-- migrations précédentes (0002 à 0006 restent inchangées).
-- À exécuter dans Supabase Dashboard > SQL Editor.

-- ==========================================================================
-- 1) LIEN COMPTE MARCHAND <-> COMMERCE
-- ==========================================================================
-- Les commerces ne sont pas encore de vraies lignes Supabase (ils vivent
-- toujours dans data.ts avec un identifiant local, ex. "merchant-002" —
-- cf. commentaire de la migration 0004). En attendant leur migration
-- complète, on relie un profil role='merchant' à SON commerce via ce même
-- identifiant local. Cette colonne n'est jamais renseignable par le
-- marchand lui-même (aucune policy d'update ne l'autorise) : seule une
-- affectation manuelle (SQL Editor ou futur dashboard admin) peut la fixer.
alter table public.profiles
  add column merchant_local_id text;

-- ==========================================================================
-- 2) LECTURE DES COMMANDES PAR LE MARCHAND PROPRIÉTAIRE
-- ==========================================================================
-- Additive : vient s'ajouter à "orders participants read" (0001/0004), qui
-- reste inchangée et ne matche jamais tant que orders.merchant_id (UUID)
-- n'est pas renseigné.
create policy "orders merchant local read" on public.orders
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'merchant'
        and merchant_local_id is not null
        and merchant_local_id = orders.merchant_local_id
    )
  );

create policy "order items merchant local read" on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders
      join public.profiles on profiles.id = auth.uid()
      where orders.id = order_items.order_id
        and profiles.role = 'merchant'
        and profiles.merchant_local_id is not null
        and profiles.merchant_local_id = orders.merchant_local_id
    )
  );

-- ==========================================================================
-- 3) MISE À JOUR DE STATUT PAR LE MARCHAND — périmètre restreint
-- ==========================================================================
-- Un marchand ne peut agir que sur SES commandes, et seulement tant
-- qu'elles sont encore de son ressort (pending/accepted/preparing) : au-delà
-- de "ready", la main passe au livreur (accept_delivery_mission / statuts
-- suivants), jamais à une simple UPDATE marchand. Il ne peut jamais écrire
-- 'driver_assigned' ou 'delivered' lui-même.
create policy "orders merchant local update" on public.orders
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'merchant'
        and merchant_local_id is not null
        and merchant_local_id = orders.merchant_local_id
    )
    and status in ('pending', 'accepted', 'preparing')
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'merchant'
        and merchant_local_id is not null
        and merchant_local_id = orders.merchant_local_id
    )
    and status in ('accepted', 'preparing', 'ready', 'merchant_rejected')
  );

-- ==========================================================================
-- 4) LE MARCHAND PEUT VOIR LE NOM DU LIVREUR ASSIGNÉ À SA COMMANDE
-- ==========================================================================
-- Même principe que "profiles readable by order customer" (0004), côté
-- marchand cette fois.
create policy "profiles readable by order merchant" on public.profiles
  for select
  using (
    exists (
      select 1 from public.orders
      join public.profiles merchant_profile on merchant_profile.id = auth.uid()
      where orders.driver_id = profiles.id
        and merchant_profile.role = 'merchant'
        and merchant_profile.merchant_local_id is not null
        and merchant_profile.merchant_local_id = orders.merchant_local_id
    )
  );
