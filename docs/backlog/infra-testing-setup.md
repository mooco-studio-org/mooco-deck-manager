# Set up a test runner

There is no testing infrastructure at all — no runner, no config, no test files.

## Why

Some of this codebase is pure logic that is cheap to test and annoying to verify by hand.
Slug generation is the clearest case: it has to be deterministic, URL-safe, and stable
forever, because the slug is the presentation's identity and appears in shared links. A
regression there breaks every existing URL silently.

## When

Once `lib/slug.ts` exists and its rules have settled. Adding a runner before there is
anything worth testing is ceremony.

## Notes

- First and most valuable target: `lib/slug.ts`, written as a pure function precisely so it
  can be tested in isolation.
- Also worth covering: the validation in the `/new` Server Action — required title, valid
  URLs, slug uniqueness — since those are the system's input boundary.
- Next 16 ships testing guides at `node_modules/next/dist/docs/01-app/02-guides/testing/`.
- `next lint` was removed in Next 16 and `next build` no longer lints, so linting is already
  a separate step (`yarn lint`). Tests should be too.
