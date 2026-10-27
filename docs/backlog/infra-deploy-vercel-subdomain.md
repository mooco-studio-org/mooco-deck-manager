# Deploy to Vercel on the MOOCO subdomain

Ship the app to Vercel and serve it from a subdomain of the main MOOCO site.

## Why

The index is only useful to the team once it is reachable without running it locally.
The data layer, Google sign-in and per-deck access are in place, so nothing blocks it
any more.

## When

Next, once the team agrees on the subdomain.

## Notes

- Production environment variables: everything in `.env.example` — `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY` and `DECK_UNLOCK_SECRET` (a fresh random value
  for production). None of them carries the `NEXT_PUBLIC_` prefix; all are read on the
  server only.
- Supabase → Authentication → URL Configuration: set the Site URL to the real domain and
  add `https://<domain>/**` to the Redirect URLs. Without it, Google sign-in comes back to
  `localhost`. This is the step most likely to be forgotten.
- The Google OAuth client needs no change: its redirect URI points at Supabase, not at the
  app.
- Decide the subdomain with the team before configuring DNS.
- `serverRuntimeConfig` / `publicRuntimeConfig` no longer exist in Next 16 — environment
  variables are the only mechanism.
- Self-hosting outside Vercel would additionally need `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  to keep Server Action closures stable across instances.
