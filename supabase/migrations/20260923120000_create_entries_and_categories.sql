create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  -- Groups are only an eyebrow label over consecutive categories, so a text column is
  -- enough; categories sharing a group are kept adjacent through `position`.
  group_name text,
  position integer not null,
  created_at timestamptz not null default now()
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('deck', 'asset')),
  slug text unique,
  title text not null check (length(trim(title)) > 0),
  description text,
  published_id text,
  file_id text,
  visit_url text,
  file_url text,
  tags text[] not null default '{}',
  visibility text not null default 'internal' check (visibility in ('internal', 'public')),
  category_id uuid references public.categories (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Decks store Google Slides ids and are served at /<slug>; assets store external URLs
  -- and have no page here. Each type must carry its own fields and none of the other's.
  constraint entries_deck_fields check (
    type <> 'deck'
    or (slug is not null and published_id is not null and visit_url is null and file_url is null)
  ),
  constraint entries_asset_fields check (
    type <> 'asset'
    or (visit_url is not null and slug is null and published_id is null and file_id is null)
  ),
  constraint entries_https_urls check (
    (visit_url is null or visit_url like 'https://%')
    and (file_url is null or file_url like 'https://%')
  )
);

create index entries_category_id_idx on public.entries (category_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_set_updated_at
before update on public.entries
for each row execute function public.set_updated_at();

-- Anonymous visitors can read public entries and every category. There are no write
-- policies: until Supabase Auth lands, writes go through the server with the secret key,
-- which bypasses RLS, and the app layer enforces who may write.
alter table public.categories enable row level security;
alter table public.entries enable row level security;

create policy "Categories are readable by anyone"
on public.categories for select
to anon, authenticated
using (true);

create policy "Public entries are readable by anyone"
on public.entries for select
to anon, authenticated
using (visibility = 'public');
