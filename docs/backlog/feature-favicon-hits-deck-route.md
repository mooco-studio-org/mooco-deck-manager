# Stop `/favicon.ico` from querying the database

Browsers request `/favicon.ico` on every page load. The app only has `app/icon.png`, so the
request falls through to the `/<slug>` route, which queries Supabase for a deck named
`favicon.ico` and renders a 404.

## Why

It is one wasted database round trip per page view, and a steady stream of 404s in the
logs that hides real ones.

## When

Before deploying ([Vercel deploy](infra-deploy-vercel-subdomain.md)) — it only matters once
real traffic arrives. Cheap to fix at any time.

## Notes

- Simplest fix: add `app/favicon.ico` (the file convention serves it statically, before
  dynamic routes are matched).
- Alternative: reject slugs that `lib/slug.ts` could never have produced (anything with a
  dot) before querying. That also filters other bot probes like `/wp-login.php`.
