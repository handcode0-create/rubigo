-- RUBIGO — migration 0008 : correction d'un risque de récursion RLS
-- sur public.profiles (probable cause du blocage de connexion : la
-- lecture du profil échouait silencieusement après une connexion réussie).
--
-- La policy "profiles readable by order merchant" (migration 0007)
-- ré-interroge public.profiles DEPUIS une policy définie sur cette même
-- table, sans passer par une fonction SECURITY DEFINER (contrairement à
-- is_admin(), qui le fait correctement). Postgres peut alors renvoyer
-- "infinite recursion detected in policy for relation profiles" — ce qui
-- bloque TOUTE lecture de profil, pour tous les rôles, pas seulement les
-- marchands.
--
-- IDEMPOTENT : rejouable sans erreur.
-- À exécuter dans Supabase Dashboard > SQL Editor.

-- Fonction SECURITY DEFINER : lit le rôle/merchant_local_id de l'appelant
-- SANS jamais repasser par les policies de public.profiles (donc aucun
-- risque de récursion), exactement comme is_admin() le fait déjà.
create or replace function public.current_merchant_local_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select merchant_local_id from public.profiles
  where id = auth.uid() and role = 'merchant';
$$;

drop policy if exists "profiles readable by order merchant" on public.profiles;
create policy "profiles readable by order merchant" on public.profiles
  for select
  using (
    exists (
      select 1 from public.orders
      where orders.driver_id = profiles.id
        and orders.merchant_local_id = public.current_merchant_local_id()
        and public.current_merchant_local_id() is not null
    )
  );
