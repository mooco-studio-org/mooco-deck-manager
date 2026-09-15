const SEPARATORS = /[\s_]+/g;
const NON_SLUG = /[^a-z0-9-]/g;
const REPEATED_DASHES = /-{2,}/g;
const EDGE_DASHES = /^-+|-+$/g;

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(SEPARATORS, "-")
    .replace(NON_SLUG, "")
    .replace(REPEATED_DASHES, "-")
    .replace(EDGE_DASHES, "");
}
