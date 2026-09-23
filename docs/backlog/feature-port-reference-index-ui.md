# Port the reference index UI

Bring the index page's layout and deck cards in line with the reference index the team
already uses.

## Why

The reference index (`reference/vanilla-deck-manager/`) is what the team is used to, and
its layout is tuned for finding a deck quickly: category grid on top, deck cards with
thumbnails below. The current index is a plain list.

## When

After [categories](feature-categories-and-groups.md) and
[thumbnails](feature-thumbnail-upload.md) exist — most of the layout is built around them.

## Notes

- Spec lives in `reference/vanilla-deck-manager/ARCHITECTURE.md` §5 and §8; the running
  page is `mooco-links.html`.
- Sticky header with a `<N> decks · <N> categorías` counter, search input and an add
  button (here, a link to `/new`).
- Deck card: 16:10 thumbnail, category eyebrow, title, description clamped to 3 lines,
  and the actions — here "Open" goes to `/<slug>` and "Editable" to the Slides editor.
- Empty states matter: "Editable" renders dashed and disabled when there is no file id.
- Tags stay searchable but are hidden on cards in the reference. Decide whether to keep the
  current tag filter chips.
- With a search term, results span all categories and the header shows the match count.
- Font is Onest via Google Fonts in the reference; the app uses Geist — decide with design.
- Keep it Server Components: search and category selection can stay in `searchParams`, as
  the current index already does.
- Edit and delete icons on the card depend on [edit and delete](feature-edit-delete-presentations.md).
