# Deploy to Vercel on the MOOCO subdomain

Ship the app to Vercel and serve it from a subdomain of the main MOOCO site.

## Why

The index is only useful to the team once it is reachable without running it locally.
It is deferred rather than done first because there is nothing worth exposing until the
data layer and authentication are real.

## When

After Phase 6 (Supabase Auth and per-presentation visibility) is closed. Do **not** deploy
before then: the index and the registration form are meant to be behind a login, and a
deploy without auth would publish them openly.

## Notes

- Production environment variables: the Supabase URL and keys. Only values that are safe to
  be public may carry the `NEXT_PUBLIC_` prefix.
- The Google OAuth callback URL has to be registered for the real domain, not just
  `localhost`. This is the step most likely to be forgotten.
- Decide the subdomain with the team before configuring DNS.
- `serverRuntimeConfig` / `publicRuntimeConfig` no longer exist in Next 16 — environment
  variables are the only mechanism.
- Self-hosting outside Vercel would additionally need `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  to keep Server Action closures stable across instances.
