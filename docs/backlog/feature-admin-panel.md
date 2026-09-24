# Admin panel for entries and categories

A page in the app where the team can see every entry and category in a table and edit them
directly, instead of going into the Supabase dashboard.

## Why

Today anything the `/new` form cannot do — renaming, reordering or regrouping a category,
fixing a typo in an entry, removing a test entry — means opening Supabase's Table Editor.
That editor writes raw rows: it skips the app's validation (Slides ids extracted from
links, `https:` only for assets, the slug rule), so a hand edit can leave data the app
does not expect. And not everyone on the team should need dashboard access.

## When

Once the reference index is migrated and the team is maintaining the catalog in this app —
that is when hand edits become frequent. It must be behind Supabase Auth before it is ever
deployed ([deploy](infra-deploy-vercel-subdomain.md) is already blocked on auth).

## Notes

- Scope, not a generic database editor: typed forms per table that reuse the same
  validation as `/new`, going through `lib/` like every other write.
- **Entries**: list with filters, edit and delete. The rules for that live in
  [edit and delete](feature-edit-delete-presentations.md) — this panel is where that UI
  lands.
- **Descriptions and tags** of the imported catalog are meant to be filled in here by the
  team — none of the 25 imported entries have them.
- **Thumbnails**: replace and remove. Replacing uploads the new image before switching
  `thumbnail_path`, then deletes the old object (`deleteThumbnail` in `lib/thumbnails.ts`);
  removing deletes the object and clears the column. Four imported entries still have
  none: Disney DCP, AB2 Commit to the Bitt, IA Studio and IA Reel.
- **Categories**: rename, reorder (`position`), set or clear `group_name`, and delete only
  when no entry uses it (the foreign key is `on delete restrict`, so the database already
  refuses otherwise — surface that as a clear message).
- Reordering is the fiddly part: moving a category means rewriting `position` for the ones
  in between; do it in one statement or an RPC so a failure cannot leave duplicates.
- Every mutation needs its own authorisation check inside the Server Action.
- Route: something like `/admin`. Add it to `RESERVED_SLUGS` in `lib/presentations.ts`
  so no deck can get it as a slug, and check no existing deck already has it.
