# Categories and groups

Organise presentations into categories that act as filters on the index, with optional
groups above them — as the reference index does.

## Why

The reference index (`reference/vanilla-deck-manager/`) is organised in two levels:
groups ("Portfolio", "Propuestas para Clientes") and categories inside them
("Capabilities", "Craft", "Propuestas Comerciales", …). The team navigates by them. This
app only has flat tags, so migrating without categories would lose that structure.

## When

Before [migrating the reference index](data-migrate-reference-index.md) — the migration
needs somewhere to put each entry's category.

## Notes

- Decided: categories are their own table, already in the schema
  (`supabase/migrations/20260923120000_create_entries_and_categories.sql`) — `id`,
  unique `name`, a `group_name` label and a `position` for the fixed order the reference
  shows. Entries point to it through a nullable `category_id`; what is left is the code
  (`lib/`, form, index).
- In the reference, a category has no id and is matched by name, and a group is just a
  `groupHeader` string on the first category of the group (`ARCHITECTURE.md` §10).
- Each entry belongs to exactly one category in the reference. `category_id` is nullable
  only so the schema could land before this feature; decide whether to make it required.
- The `/new` form in the reference lets you pick an existing category or create one inline
  ("+ Nueva categoría…").
- UI: a grid of category cards that select what the deck grid shows, with a link count per
  card; search overrides the selection. See [reference index UI](feature-port-reference-index-ui.md).
