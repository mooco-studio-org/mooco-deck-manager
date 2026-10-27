-- An admin-only category, and every entry in it, is left out of the index for anyone who
-- is not an admin. It does not change who can open a deck's link: that still follows the
-- deck's own visibility, so a public proposal can be sent to its client as before.
alter table public.categories add column admin_only boolean not null default false;

update public.categories set admin_only = true where name = 'Propuestas Comerciales';
