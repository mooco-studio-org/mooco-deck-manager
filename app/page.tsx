import { getViewer } from "@/lib/viewer";
import { listEntries, type Entry } from "@/lib/presentations";
import { groupCategories, listCategories, type Category } from "@/lib/categories";
import { matchesQuery } from "@/lib/search";
import { SiteHeader } from "./_components/site-header";
import { CategoryGrid } from "./_components/category-grid";
import { EntryCard } from "./_components/entry-card";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function countByCategory(entries: Entry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.categoryId, (counts.get(entry.categoryId) ?? 0) + 1);
  }
  return counts;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

// A search spans every category, as in the reference; only without one does the selected
// category narrow the list.
function selectEntries(entries: Entry[], query: string, category: Category | undefined) {
  if (query) {
    const found = entries.filter((entry) => matchesQuery(entry, query));
    return {
      title: "Results",
      subtitle: `${plural(found.length, "match", "matches")} · “${query}”`,
      shown: found,
    };
  }

  const shown = category ? entries.filter((entry) => entry.categoryId === category.id) : entries;
  return {
    title: category?.name ?? "All entries",
    subtitle: plural(shown.length, "item", "items"),
    shown,
  };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const query = readParam(params, "q");

  const viewer = await getViewer();
  const [entries, categories] = await Promise.all([listEntries(viewer), listCategories()]);

  const selected = categories.find((c) => c.id === readParam(params, "category"));
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const { title, subtitle, shown } = selectEntries(entries, query, selected);

  return (
    <>
      <SiteHeader entryCount={entries.length} categoryCount={categories.length} query={query} />

      <main className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-12">
        <section className="pt-14 pb-6">
          <CategoryGrid
            groups={groupCategories(categories)}
            selectedId={query ? null : (selected?.id ?? null)}
            counts={countByCategory(entries)}
          />
        </section>

        <section className="pt-10 pb-5" aria-labelledby="entries-title">
          <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h2
              id="entries-title"
              className="text-[clamp(32px,5vw,48px)] leading-none font-extrabold tracking-[-0.03em]"
            >
              {title}
            </h2>
            <span className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
              {subtitle}
            </span>
          </div>

          {shown.length === 0 ? (
            <p className="px-5 py-20 text-center text-sm font-medium text-ink-muted">
              {query ? `No results for “${query}”.` : "Nothing here yet."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-3">
              {shown.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  categoryName={categoryNames.get(entry.categoryId) ?? ""}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
