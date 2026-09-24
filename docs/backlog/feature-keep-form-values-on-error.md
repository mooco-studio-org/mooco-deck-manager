# Keep form values when a submission fails

When `/new` returns a validation error, every field the user typed is cleared, not just the
one that failed.

## Why

React resets a form after its action finishes, whatever the result. A typo in one link
means retyping the title, description, tags and the other link. It gets worse as the form
grows (categories, thumbnails).

## When

Soon: the form now has a thumbnail field, and a validation error on any other field means
choosing the image again, since a browser cannot refill a file input.

## Notes

- In `app/new/form.tsx`, the type radios and the category select already work around the
  reset (the radios tie `defaultChecked` to state, the select is re-applied in an effect),
  because they decide which fields are shown. The other fields have no such protection.
- Usual approach: return the submitted values in `FormState` alongside `errors` and feed
  them back as `defaultValue`s. Check the Next 16 forms guide
  (`node_modules/next/dist/docs/01-app/02-guides/forms.md`) for the current recommendation.
- File inputs cannot be restored. Keeping the thumbnail across a failed submission means
  uploading it when it is picked and carrying the stored path in state — which also needs
  a cleanup for images whose form is abandoned. That trade-off was declined when
  thumbnails shipped; revisit it here.
