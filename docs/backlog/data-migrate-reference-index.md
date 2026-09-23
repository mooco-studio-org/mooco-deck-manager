# Migrate the reference index into the database

Import the ~43 entries of the vanilla deck manager in `reference/vanilla-deck-manager/`
into Supabase, converting its stored URLs into the Google Slides ids this app keeps.

## Why

The vanilla index is the catalog the team uses today. Until its entries live here, this
app is an empty shell and the team keeps maintaining two lists.

## When

After Supabase is integrated into the app and the model decisions this depends on are
settled: [categories](feature-categories-and-groups.md) and
[thumbnails](feature-thumbnail-upload.md). Migrating before then means migrating twice.

## Notes

- Source of truth is the JSON block `<script id="links-data">` in
  `reference/vanilla-deck-manager/mooco-links.html` (`sheets.evergreen.categories[].links[]`),
  not the `.xlsx`, which is an older snapshot. Shape documented in its `ARCHITECTURE.md` §4.
- **Type by URL**: an `editableUrl` on `docs.google.com/presentation/…` makes the entry a
  `deck` (35 entries); `drive.google.com/file/d/…` (4) or any other host makes it an
  `asset`, with `url` as `visitUrl` and `editableUrl` as `fileUrl`. Entries with an empty
  `url` (9) get classified by hand.
- **File id** (decks): `extractFileId` in `lib/google-slides.ts` already handles the
  `/edit` URLs.
- **Published id is not in the data** (decks). `url` points to the old wrapper folders on
  the main site (`https://mooco.studio/Capabilities/`, …), not to Google Slides. The
  `2PACX-…` id has to be recovered from each wrapper page's embed iframe, or by
  re-publishing the deck from Slides. AI Studio's empty `url` is intentional, per the
  reference doc §13.
- Write it as a one-off script that emits rows for review before inserting — the id
  recovery will have gaps that need a human decision.
- Slugs (decks only): generated with `lib/slug.ts` from the entry name, once, as for any
  new deck. Worth checking for collisions (several entries share names like
  "Capabilities"). Assets get no slug.
- The wrapper URLs have already been sent to clients. Redirecting
  `mooco.studio/<Folder>` to this app's `/<slug>` is a main-site change, but the
  old-URL → slug mapping falls out of this migration and should be kept.
- Thumbnails: the 43 WebP files in `reference/vanilla-deck-manager/thumbs/` go to
  whatever storage [thumbnail upload](feature-thumbnail-upload.md) settles on, and each
  entry's `thumb` filename maps to its row.
- Default `visibility` for imported entries needs a decision; the client proposals likely
  should not be `public`.
- Once migrated and verified, decide whether `reference/` still earns its place in the repo.
