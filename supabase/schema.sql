-- RUBIGO — schéma initial Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor avec un compte administrateur.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'merchant', 'driver', 'admin');
create type public.order_status as enum ('pending', 'accepted', 'preparing', 'ready', 'driver_assigned', 'picked_up', 'delivering', 'delivered', 'cancelled', 'merchant_rejected');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.driver_status as enum ('offline', 'available', 'busy');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  name text not null,
  phone text,
  city text,
  initials text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label text not null unique,
  icon text not null default 'CT',
  created_at timestamptz not null default now()
);

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references public.profiles(id) on delete set null,
  category_id text not null references public.categories(id) on update cascade,
  name text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'closed', 'temporarily_closed', 'suspended')),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  latitude double precision,
  longitude double precision,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  category_id text not null references public.categories(id) on update cascade,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  line text not null,
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index addresses_one_default_per_customer on public.addresses(customer_id) where is_default;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.profiles(id),
  merchant_id uuid not null references public.merchants(id),
  driver_id uuid references public.profiles(id),
  delivery_address_id uuid references public.addresses(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  delivery_pin text check (delivery_pin ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders(customer_id, created_at desc);
create index orders_merchant_idx on public.orders(merchant_id, status);
create index orders_driver_idx on public.orders(driver_id, status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger merchants_updated_at before update on public.merchants for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active);
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.merchants enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;

create policy "profiles own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "catalog readable" on public.categories for select using (true);
create policy "catalog admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "merchants readable" on public.merchants for select using (true);
create policy "merchant owner or admin update" on public.merchants for update using (owner_id = auth.uid() or public.is_admin());
create policy "products readable" on public.products for select using (true);
create policy "product merchant or admin write" on public.products for all using (public.is_admin() or exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid())) with check (public.is_admin() or exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid()));
create policy "addresses own" on public.addresses for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "orders participants read" on public.orders for select using (customer_id = auth.uid() or driver_id = auth.uid() or public.is_admin() or exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid()));
create policy "order items participants read" on public.order_items for select using (exists (select 1 from public.orders where id = order_id and (customer_id = auth.uid() or driver_id = auth.uid() or public.is_admin() or exists (select 1 from public.merchants where id = merchant_id and owner_id = auth.uid()))));
create policy "notifications own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
