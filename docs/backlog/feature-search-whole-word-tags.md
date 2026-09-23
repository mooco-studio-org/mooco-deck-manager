# Whole-word matching for tags in search

Match the search query against tags as whole words, while keeping substring matching for
title and description.

## Why

Tags in the index are short and mixed Spanish/English. With substring matching, a query
like `IA` also hits tags such as "Radiografias" or "Tutoriales". The reference index
(`reference/vanilla-deck-manager/`) solved this with a whole-word rule on tags only
(`ARCHITECTURE.md` §8). This app currently matches tags by substring in `app/page.tsx`.

## When

When [migrating the reference index](data-migrate-reference-index.md) — its tags are what
make the false matches show up.

## Notes

- Keep substring matching for title and description: users expect "Para" to find
  "Paramount".
- Escape the query before building a `\b…\b` regex; `\b` is ASCII-only in JavaScript, so
  check behaviour with accented tags.
- Reference also searches `url` and `editableUrl`; here those are ids, which are not worth
  searching.
- Once search moves to Supabase, this rule has to be reproduced in the query, not only in
  the page.
- A pure matching function is a good first target for [the test runner](infra-testing-setup.md).
