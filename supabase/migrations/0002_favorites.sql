-- RUBIGO — migration 0002 : favoris
-- Additif uniquement : ne modifie aucune table ni policy existante.
-- À exécuter dans Supabase Dashboard > SQL Editor.

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, merchant_id)
);

create index favorites_customer_idx on public.favorites(customer_id);

alter table public.favorites enable row level security;

-- Un client ne voit et ne modifie que ses propres favoris.
create policy "favorites own" on public.favorites
  for all
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
