# Two entry types: decks and assets

Split index entries into `deck` (a Google Slides presentation played on this subdomain)
and `asset` (anything else — reels, videos, external files — whose Visit goes to an
external URL).

## Why

The model assumes every entry is a Slides deck (`publishedId` is required). The reference
index (`reference/vanilla-deck-manager/`) is an index of presentations *and* files: 4
entries point to `drive.google.com/file/d/…` (videos), one to `shots.re`, and the team
will want to add other assets. They cannot be stored or migrated as decks.

## When

Before [migrating the reference index](data-migrate-reference-index.md) — the migration
script needs the type to decide what each entry becomes.

## Notes

Decided design:

- **`deck`**: as today — `publishedId` required, `fileId` optional, rendered by the
  `/<slug>` full-screen wrapper. Stores Slides ids, never URLs.
- **`asset`**: `visitUrl` required, `fileUrl` optional. Stores URLs, since assets can live
  anywhere. This is the one sanctioned exception to the ids-only rule (see `CLAUDE.md`).
- Model it as a discriminated union on `type: "deck" | "asset"` in TypeScript, so each
  type's required fields are enforced by the compiler.
- **Assets get a slug too.** The slug is the database key and edit/delete need it.
  `/<slug>` for an asset redirects to its `visitUrl`, so every link sent out starts on the
  subdomain and the target can change without re-sending links.
- One table with a `type` column, plus database check constraints per type
  (`published_id` not null for decks, `visit_url` not null for assets). The index and
  search list both types together, so two tables would only add joins.
- Form: a "Deck / Asset" selector that swaps the visible fields. That toggle needs a small
  client component; the Server Action must still validate per the submitted `type` and
  never trust which fields the form happened to show.
- Validate asset URLs server-side: `https:` only, so a `javascript:` URL can never reach an
  `href` on the index.
- Visibility only hides an asset's entry from the index — the external file stays
  reachable by anyone who has its URL. Worth saying in the form.
- Optional later: Drive video files have an embeddable `/preview` URL, so a Drive asset
  could get its own wrapper page instead of redirecting. Not needed to start.
- Changing the shape of a presentation record is a breaking change per
  `docs/commits-and-releases-workflow.md`.
