import Link from "next/link";
import type { CategoryGroup } from "@/lib/categories";

function countLabel(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

// Choosing a category clears the search, as in the reference: the search overrides the
// category, so keeping it would hide the choice just made. Choosing the selected one again
// goes back to showing everything.
function categoryHref(categoryId: string, selected: boolean) {
  return selected ? "/" : { pathname: "/", query: { category: categoryId } };
}

export function CategoryGrid({
  groups,
  selectedId,
  counts,
}: {
  groups: CategoryGroup[];
  selectedId: string | null;
  counts: Map<string, number>;
}) {
  return (
    <nav
      aria-label="Categories"
      className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-3"
    >
      {groups.flatMap((group) =>
        group.categories.map((category, index) => {
          const selected = category.id === selectedId;
          return (
            <Link
              key={category.id}
              href={categoryHref(category.id, selected)}
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-[130px] flex-col justify-between gap-6 rounded-[20px] border-[1.5px] px-[26px] py-6 transition-[background-color,border-color,transform] active:translate-y-px ${
                selected
                  ? "border-card bg-card text-card-ink hover:bg-card-surface"
                  : "border-line bg-surface-alt hover:border-ink-muted hover:bg-surface-alt-hover"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`text-[10px] font-bold tracking-[0.18em] uppercase ${
                    selected ? "text-card-ink-faint" : "text-ink-faint"
                  }`}
                >
                  {index === 0 ? group.name : null}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.02em] whitespace-nowrap ${
                    selected ? "bg-white/10 text-card-ink-muted" : "bg-black/[0.06] text-ink-muted"
                  }`}
                >
                  {countLabel(counts.get(category.id) ?? 0)}
                </span>
              </div>
              <span className="text-[22px] leading-[1.05] font-extrabold tracking-[-0.02em] min-[700px]:text-[26px]">
                {category.name}
              </span>
            </Link>
          );
        }),
      )}
    </nav>
  );
}
