alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.lead_items enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

grant usage on schema public to anon, authenticated, service_role;

grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;

grant select, insert, update, delete on public.categories to service_role;
grant select, insert, update, delete on public.products to service_role;
grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.lead_items to service_role;