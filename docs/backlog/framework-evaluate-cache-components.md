# Evaluate enabling Cache Components

Decide whether to set `cacheComponents: true` in `next.config.ts`.

## Why

It is off by default in Next 16.3.4, but it is the direction the framework is moving and
the Next 16 documentation is written assuming it. Migrating later is more work than
adopting it early, so the decision deserves a deliberate revisit rather than drifting.

## When

Once the MVP is stable and the routes have settled. Doing it mid-build would mean fighting
the framework's prerender validation while the shape of the pages is still changing.

## Notes

What flipping the flag requires:

- `<Suspense>` around every uncached read and every runtime API — `cookies()`, `headers()`,
  `searchParams`, and `params` when not covered by `generateStaticParams`.
- Route segment configs (`dynamic`, `revalidate`, `fetchCache`) start erroring;
  `dynamicParams` is rejected outright. Unknown slugs get handled with `notFound()`.
- `generateStaticParams` must return at least one entry — returning `[]` becomes an error.
- Cached functions cannot read `cookies()` / `headers()`, and the restriction follows the
  call stack. This matters directly here: a Supabase client built from a per-request auth
  cookie cannot live inside a `use cache` scope.
- Default `use cache` storage is in-memory and per-instance. Durable caching needs
  `use cache: remote` with a cache handler.
- Navigation state is preserved via React `<Activity>` — routes are hidden, not unmounted,
  so form inputs and `useActionState` results survive navigating away and back.

Reference: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`
and `01-app/02-guides/migrating-to-cache-components.md`.
