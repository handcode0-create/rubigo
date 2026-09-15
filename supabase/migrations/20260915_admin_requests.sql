-- RUBIGO — Admin workflow
-- Creates the durable queue used by the Admin dashboard for:
-- merchant applications, driver applications, document reviews and account reports.
--
-- Safe to run once. No existing table is altered.

create table if not exists public.admin_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (
    request_type in (
      'merchant_application',
      'driver_application',
      'document_review',
      'account_report'
    )
  ),
  requested_role text null check (
    requested_role in ('customer', 'driver', 'merchant', 'admin')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'suspended', 'cancelled')
  ),
  title text not null,
  note text null,
  payload jsonb not null default '{}'::jsonb,
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_requests_status_idx
  on public.admin_requests(status);

create index if not exists admin_requests_type_idx
  on public.admin_requests(request_type);

create index if not exists admin_requests_user_idx
  on public.admin_requests(user_id);

create index if not exists admin_requests_created_at_idx
  on public.admin_requests(created_at desc);

alter table public.admin_requests enable row level security;

drop policy if exists "admin_requests_admin_read" on public.admin_requests;
create policy "admin_requests_admin_read"
on public.admin_requests
for select
to authenticated
using (is_admin());

drop policy if exists "admin_requests_admin_insert" on public.admin_requests;
create policy "admin_requests_admin_insert"
on public.admin_requests
for insert
to authenticated
with check (is_admin());

drop policy if exists "admin_requests_admin_update" on public.admin_requests;
create policy "admin_requests_admin_update"
on public.admin_requests
for update
to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "admin_requests_admin_delete" on public.admin_requests;
create policy "admin_requests_admin_delete"
on public.admin_requests
for delete
to authenticated
using (is_admin());

-- Permet à un utilisateur authentifié de déposer sa propre demande
-- professionnelle. Aucune attribution de privilège n'est effectuée ici.
drop policy if exists "admin_requests_user_submit_professional" on public.admin_requests;
create policy "admin_requests_user_submit_professional"
on public.admin_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
  and request_type in ('merchant_application', 'driver_application')
  and requested_role in ('merchant', 'driver')
  and status = 'pending'
);

-- Un même utilisateur ne doit pas avoir deux candidatures ouvertes
-- du même type en parallèle.
create unique index if not exists admin_requests_open_role_unique
  on public.admin_requests(user_id, request_type)
  where status = 'pending'
    and request_type in ('merchant_application', 'driver_application');
