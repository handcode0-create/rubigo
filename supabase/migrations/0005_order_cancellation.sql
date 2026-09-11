-- RUBIGO — migration 0005 : annulation de commande par le client
-- Additif uniquement : ne modifie aucune colonne/policy existante.
-- IDEMPOTENT : rejouable sans erreur même partiellement déjà appliquée.
-- À exécuter dans Supabase Dashboard > SQL Editor.

alter table public.orders
  add column if not exists cancelled_at timestamptz;

-- Le client ne peut annuler que SA commande, et seulement tant qu'elle est
-- encore "pending" ou "accepted" (avant que le commerçant ait commencé la
-- préparation) — même règle que orderService.canTransition côté frontend.
-- Il ne peut rien modifier d'autre que le statut vers 'cancelled'.
drop policy if exists "orders customer cancel" on public.orders;
create policy "orders customer cancel" on public.orders
  for update
  using (customer_id = auth.uid() and status in ('pending', 'accepted'))
  with check (customer_id = auth.uid() and status = 'cancelled');
