-- RUBIGO — migration 0003 : autoriser la création de son propre profil
-- Additif uniquement : ne modifie aucune policy existante (select/update inchangées).
-- Nécessaire pour que l'inscription réelle (étape 4) fonctionne : sans cette
-- policy, l'insertion automatique du profil après signUp() est bloquée par la RLS.
-- À exécuter dans Supabase Dashboard > SQL Editor.

-- Un utilisateur authentifié ne peut créer QUE son propre profil, et
-- uniquement avec le rôle "customer" — jamais merchant/driver/admin depuis le
-- frontend. Toute élévation de rôle doit passer par un canal admin (dashboard,
-- fonction backend), jamais par cette policy.
create policy "profiles insert own as customer" on public.profiles
  for insert
  with check (id = auth.uid() and role = 'customer');
