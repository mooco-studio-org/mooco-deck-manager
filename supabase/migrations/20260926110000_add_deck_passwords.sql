-- Lets a client open a non-public deck without an account. Stored in plain text on
-- purpose, so the team can look a password up and resend it; the bar is the same as the
-- published Google Slides link the deck already relies on. Only the server reads it: the
-- API roles have no grants on entries and RLS has no policy that exposes it to them.
alter table public.entries add column access_password text;

alter table public.entries add constraint entries_password_not_public
  check (visibility <> 'public' or access_password is null);
