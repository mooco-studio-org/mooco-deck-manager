-- New Supabase projects no longer grant table privileges automatically to the API roles.
-- The app reads and writes through the server with the secret key (service_role), so
-- that is the only role granted for now. anon and authenticated get their grants
-- together with Supabase Auth, when RLS policies start doing real work.
grant select, insert, update, delete on public.entries to service_role;
grant select, insert, update, delete on public.categories to service_role;
