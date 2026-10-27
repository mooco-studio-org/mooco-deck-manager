-- Admins see every entry, restricted ones included, and manage who can open what.
create table public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

insert into public.admins (email) values ('rainier.raydan@mooco.studio');

-- A restricted entry is visible only to the emails listed for it in entry_access, plus
-- admins. Unlike internal, being on the MOOCO team is not enough.
alter table public.entries drop constraint entries_visibility_check;
alter table public.entries add constraint entries_visibility_check
  check (visibility in ('internal', 'public', 'restricted'));

create table public.entry_access (
  entry_id uuid not null references public.entries (id) on delete cascade,
  email text not null check (email = lower(email)),
  created_at timestamptz not null default now(),
  primary key (entry_id, email)
);

create index entry_access_email_idx on public.entry_access (email);

-- Both tables are read and written only by the server with the secret key; RLS on with no
-- policies keeps them closed to the public API roles.
alter table public.admins enable row level security;
alter table public.entry_access enable row level security;

grant select, insert, update, delete on public.admins to service_role;
grant select, insert, update, delete on public.entry_access to service_role;
