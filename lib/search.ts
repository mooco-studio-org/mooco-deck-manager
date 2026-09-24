type Searchable = {
  title: string;
  description: string | null;
  tags: string[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Title and description match by substring, so "Para" still finds "Paramount". Tags must
// match as whole words, so a short query like "IA" does not hit "Radiografias". The word
// boundary is spelled out with Unicode classes because `\b` in JavaScript only knows
// ASCII letters and would break on tags like "diseño".
export function matchesQuery(entry: Searchable, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  if (
    entry.title.toLowerCase().includes(needle) ||
    (entry.description ?? "").toLowerCase().includes(needle)
  ) {
    return true;
  }

  const wholeWord = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(needle)}(?![\\p{L}\\p{N}])`,
    "iu",
  );
  return entry.tags.some((tag) => wholeWord.test(tag));
}
