-- RUBIGO — migration 0010 : catalogue produits réel (espace commerçant)
-- IDEMPOTENT. À exécuter dans Supabase Dashboard > SQL Editor.

-- ==========================================================================
-- 1) COLONNES
-- ==========================================================================
-- Même contrainte que pour orders (migration 0004) : les commerces ne sont
-- pas encore de vraies lignes Supabase, donc merchant_id (UUID, NOT NULL)
-- ne peut pas être renseigné pour de vrais produits créés depuis l'app.
-- On assouplit la colonne et on utilise merchant_local_id (même convention
-- que orders.merchant_local_id / profiles.merchant_local_id).
--
-- category_id (FK vers la taxonomie de découverte public.categories,
-- ex. "restaurants", "markets"...) reste utile pour le catalogue client,
-- mais n'a pas de sens comme rubrique de menu ("Plats", "Boissons"...)
-- éditable produit par produit : on la rend optionnelle et on ajoute une
-- colonne texte libre `category` pour cet usage-là, cohérente avec
-- data.ts (Product.category).
alter table public.products
  alter column merchant_id drop not null,
  alter column category_id drop not null,
  add column if not exists merchant_local_id text,
  add column if not exists category text,
  add column if not exists image_path text;

-- ==========================================================================
-- 2) RLS — un commerçant gère uniquement les produits de SON commerce
-- ==========================================================================
-- Additive : "products readable" (catalogue client, select using true) et
-- "product merchant or admin write" (basé sur merchant_id UUID, prêt pour
-- quand les commerces seront pleinement migrés) restent inchangées.
drop policy if exists "products merchant local all" on public.products;
create policy "products merchant local all" on public.products
  for all
  using (
    merchant_local_id is not null
    and merchant_local_id = public.current_merchant_local_id()
  )
  with check (
    merchant_local_id is not null
    and merchant_local_id = public.current_merchant_local_id()
  );

-- ==========================================================================
-- 3) STORAGE — bucket public pour les photos produit
-- ==========================================================================
-- Lecture publique (les photos doivent s'afficher pour n'importe quel
-- client, connecté ou non) ; écriture/suppression réservées au commerçant
-- propriétaire, via la convention de chemin "{merchant_local_id}/fichier".
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select
  using (bucket_id = 'product-images');

drop policy if exists "product images merchant insert" on storage.objects;
create policy "product images merchant insert" on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_merchant_local_id()
  );

drop policy if exists "product images merchant update" on storage.objects;
create policy "product images merchant update" on storage.objects
  for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_merchant_local_id()
  );

drop policy if exists "product images merchant delete" on storage.objects;
create policy "product images merchant delete" on storage.objects
  for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.current_merchant_local_id()
  );
