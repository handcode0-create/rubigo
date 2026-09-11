-- ============================================================
-- RUBIGO — correction complète de la RPC confirm_delivery
-- ============================================================
--
-- Objectif : corriger l'erreur Supabase :
--   ERROR 42883: function crypt(text, text) does not exist
--
-- Le problème vient du fait que pgcrypto est installé dans le
-- schéma `extensions`, alors que la fonction confirm_delivery
-- appelle crypt()/gen_salt() sans qualifier leur schéma.
--
-- IMPORTANT :
-- - ce script NE réécrit PAS la logique métier de confirm_delivery;
-- - il récupère la définition actuelle de la fonction;
-- - il ne change que les appels non qualifiés crypt()/gen_salt();
-- - il recrée ensuite exactement la même fonction;
-- - le PIN continue donc d'être vérifié côté Supabase;
-- - aucune comparaison n'est déplacée dans le frontend.
--
-- À exécuter dans : Supabase > SQL Editor
-- ============================================================

-- 1. S'assurer que pgcrypto est disponible dans le schéma attendu.
create extension if not exists pgcrypto with schema extensions;

-- 2. Requalifier les appels crypt()/gen_salt() dans la définition
--    existante de public.confirm_delivery.
DO $$
DECLARE
  v_function_oid oid;
  v_definition text;
BEGIN
  SELECT p.oid
  INTO v_function_oid
  FROM pg_proc p
  INNER JOIN pg_namespace n
    ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'confirm_delivery'
    AND p.pronargs = 2
  ORDER BY p.oid DESC
  LIMIT 1;

  IF v_function_oid IS NULL THEN
    RAISE EXCEPTION
      'RUBIGO : la fonction public.confirm_delivery avec 2 arguments est introuvable.';
  END IF;

  -- Récupère la définition exacte actuellement installée.
  v_definition := pg_get_functiondef(v_function_oid);

  -- Protéger d'abord les occurrences déjà qualifiées afin d'éviter
  -- de produire extensions.extensions.crypt(...).
  v_definition := replace(
    v_definition,
    'extensions.crypt(',
    '__RUBIGO_ALREADY_QUALIFIED_CRYPT__('
  );

  v_definition := replace(
    v_definition,
    'extensions.gen_salt(',
    '__RUBIGO_ALREADY_QUALIFIED_GEN_SALT__('
  );

  -- Qualifier les appels non qualifiés.
  v_definition := replace(
    v_definition,
    'crypt(',
    'extensions.crypt('
  );

  v_definition := replace(
    v_definition,
    'gen_salt(',
    'extensions.gen_salt('
  );

  -- Restaurer les appels déjà correctement qualifiés.
  v_definition := replace(
    v_definition,
    '__RUBIGO_ALREADY_QUALIFIED_CRYPT__(',
    'extensions.crypt('
  );

  v_definition := replace(
    v_definition,
    '__RUBIGO_ALREADY_QUALIFIED_GEN_SALT__(',
    'extensions.gen_salt('
  );

  EXECUTE v_definition;
END
$$;

-- 3. Vérifications facultatives : elles permettent de confirmer
--    que les fonctions pgcrypto existent bien au bon endroit.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
INNER JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'extensions'
  AND p.proname IN ('crypt', 'gen_salt')
ORDER BY p.proname, arguments;

-- 4. Vérifier la définition finale de confirm_delivery.
SELECT pg_get_functiondef(p.oid) AS confirm_delivery_definition
FROM pg_proc p
INNER JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'confirm_delivery'
  AND p.pronargs = 2
ORDER BY p.oid DESC
LIMIT 1;

-- ============================================================
-- TEST ATTENDU
-- ============================================================
-- Le frontend RUBIGO appelle déjà :
--
-- supabase.rpc('confirm_delivery', {
--   p_order_id: orderId,
--   p_pin: pin,
-- })
--
-- Aucun changement frontend n'est nécessaire pour ce correctif.
-- ============================================================
