# Admin panel for entries and categories

A page in the app, for admins only, where they can see every entry and category in a table,
see at a glance who can reach what, and edit it directly instead of going into the Supabase
dashboard.

## Why

Today anything the `/new` form cannot do — renaming, reordering or regrouping a category,
fixing a typo in an entry, removing a test entry — means opening Supabase's Table Editor.
That editor writes raw rows: it skips the app's validation (Slides ids extracted from
links, `https:` only for assets, the slug rule), so a hand edit can leave data the app
does not expect. And not everyone on the team should need dashboard access.

Access control made this more pressing: which categories are admin-only, which decks are
restricted and to whom, and which carry a password can only be checked today with SQL or
the Table Editor — nothing in the app shows it, and a mistake there exposes a deck.

## When

Now that sign-in and roles are in place, whenever hand edits in the Table Editor start
getting frequent. The access overview (below) is the first slice worth shipping on its own:
read-only, no new write paths, and it answers the most common question.

## Notes

- **Access overview first**, read-only:
  - Categories with their `admin_only` flag, in display order, with how many entries each
    holds.
  - Every entry with its visibility, whether it has a password, and, for restricted
    decks, its access list. Filter by "admin-only category", "restricted" and "has
    password", so "what can a non-admin not see?" is one click.
  - There is no "admin-only deck" as such: a deck is hidden from non-admins either by
    sitting in an `admin_only` category (hidden from the index, but its link still follows
    its visibility) or by being `restricted` with no one but admins on its list. The
    overview should make that distinction visible, since only the second blocks the link.
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
- **Access**: edit a deck's visibility, its access list (`entry_access`) and its client
  password (`access_password`, stored in plain text so it can be shown here and resent).
  Manage the `admins` table and each category's `admin_only` flag. Admin-only actions;
  today all of this is done in the Table Editor.
- Admins only: the page checks `viewer.isAdmin` (`lib/viewer.ts`) and every mutation
  repeats that check inside its Server Action — the page guard alone does not protect
  the action. Link to it from the header only for admins.
- Route: something like `/admin`. Add it to `RESERVED_SLUGS` in `lib/presentations.ts`
  so no deck can get it as a slug, and check no existing deck already has it.
