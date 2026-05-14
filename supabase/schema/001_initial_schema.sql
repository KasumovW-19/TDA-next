create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  category text not null,
  short_description text,
  description text,
  price numeric(12, 2),
  old_price numeric(12, 2),
  unit text not null default 'шт',
  image_url text,
  gallery text[] not null default '{}',
  in_stock boolean not null default true,
  is_active boolean not null default true,
  is_popular boolean not null default false,
  is_new boolean not null default false,
  is_custom_order boolean not null default false,
  rating numeric(2, 1) not null default 5.0,
  reviews_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  contact_preference text not null default 'any',
  message text,
  source text not null default 'site',
  status text not null default 'new',
  total_amount numeric(12, 2),
  manager_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_items (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12, 2),
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists categories_active_sort_idx
on public.categories (is_active, sort_order);

create index if not exists products_active_sort_idx
on public.products (is_active, sort_order);

create index if not exists products_category_idx
on public.products (category_id);

create index if not exists leads_status_created_idx
on public.leads (status, created_at desc);