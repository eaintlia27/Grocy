-- Run this SQL once in your Supabase Dashboard -> SQL Editor

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  note text,
  purchased boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  purchased_at timestamptz
);

-- Enable Row Level Security so only logged-in family accounts can view and edit the list
alter table public.grocery_items enable row level security;

create policy "Authenticated family members can view grocery items"
  on public.grocery_items
  for select
  to authenticated
  using (true);

create policy "Authenticated family members can add grocery items"
  on public.grocery_items
  for insert
  to authenticated
  with check (true);

create policy "Authenticated family members can update grocery items"
  on public.grocery_items
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated family members can delete grocery items"
  on public.grocery_items
  for delete
  to authenticated
  using (true);

-- Enable live syncing across family devices
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'grocery_items'
  ) then
    alter publication supabase_realtime add table public.grocery_items;
  end if;
end $$;

-- Initial sample grocery items (inserted only if table is currently empty)
insert into public.grocery_items (name, note, purchased, created_at)
select v.name, v.note, false, now() - (v.ord * interval '1 second')
from (
  values
    (0, 'Milk', '1 liter'),
    (1, 'Eggs', '1 dozen'),
    (2, 'Bread', 'Whole wheat'),
    (3, 'Rice', '5 kg bag'),
    (4, 'Chicken', '500 g'),
    (5, 'Potatoes', '1 kg'),
    (6, 'Onions', '500 g'),
    (7, 'Apples', '6 pieces'),
    (8, 'Coffee', 'Ground coffee'),
    (9, 'Dishwashing Liquid', 'Any lemon-scented brand')
) as v(ord, name, note)
where not exists (select 1 from public.grocery_items);
