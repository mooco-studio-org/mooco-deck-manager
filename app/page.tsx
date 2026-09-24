import Link from "next/link";
import type { ReactNode } from "react";
import { getViewer } from "@/lib/viewer";
import { listEntries, type Entry } from "@/lib/presentations";
import { groupCategories, listCategories, type CategoryGroup } from "@/lib/categories";
import { editorUrl } from "@/lib/google-slides";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

type Filters = { q: string; tag: string; category: string };

function matches(entry: Entry, { q, tag, category }: Filters): boolean {
  const haystack = [entry.title, entry.description ?? "", ...entry.tags]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes(q.toLowerCase()) &&
    (tag === "" || entry.tags.includes(tag)) &&
    (category === "" || entry.categoryId === category)
  );
}

// Clicking the active filter clears it; the other filters are kept either way.
function toggleHref(filters: Filters, key: "tag" | "category", value: string) {
  const next = { ...filters, [key]: filters[key] === value ? "" : value };
  const query = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== ""));
  return { pathname: "/", query };
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: ReturnType<typeof toggleHref>;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-current bg-current/10 font-medium"
          : "border-current/20 opacity-70 hover:opacity-100"
      }`}
    >
      {children}
    </Link>
  );
}

function CategoryNav({
  groups,
  filters,
  counts,
}: {
  groups: CategoryGroup[];
  filters: Filters;
  counts: Map<string, number>;
}) {
  return (
    <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-3" aria-label="Filter by category">
      {groups.map((group) => (
        <div key={group.categories[0].id}>
          <p className="mb-1 h-4 text-[10px] font-medium uppercase tracking-wider opacity-50">
            {group.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.categories.map((category) => (
              <FilterChip
                key={category.id}
                href={toggleHref(filters, "category", category.id)}
                active={filters.category === category.id}
              >
                {category.name}{" "}
                <span className="opacity-60">{counts.get(category.id) ?? 0}</span>
              </FilterChip>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

const actionClass = "underline underline-offset-4 opacity-70 hover:opacity-100";

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={actionClass}>
      {children}
    </a>
  );
}

function EntryActions({ entry }: { entry: Entry }) {
  if (entry.type === "asset") {
    return (
      <>
        <ExternalLink href={entry.visitUrl}>Visit</ExternalLink>
        {entry.fileUrl && <ExternalLink href={entry.fileUrl}>File</ExternalLink>}
      </>
    );
  }

  return (
    <>
      <ExternalLink href={`/${entry.slug}`}>Present</ExternalLink>
      {entry.fileId && <ExternalLink href={editorUrl(entry.fileId)}>Edit</ExternalLink>}
    </>
  );
}

const titleClass = "text-lg font-medium underline-offset-4 hover:underline";

function EntryTitle({ entry }: { entry: Entry }) {
  if (entry.type === "asset") {
    return (
      <a href={entry.visitUrl} target="_blank" rel="noreferrer" className={titleClass}>
        {entry.title}
      </a>
    );
  }

  return (
    <Link href={`/${entry.slug}`} className={titleClass}>
      {entry.title}
    </Link>
  );
}

const badgeClass = "rounded-full border border-current/30 px-2 py-0.5";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters: Filters = {
    q: readParam(params, "q"),
    tag: readParam(params, "tag"),
    category: readParam(params, "category"),
  };

  const viewer = await getViewer();
  const [entries, categories] = await Promise.all([listEntries(viewer), listCategories()]);
  const visible = entries.filter((entry) => matches(entry, filters));

  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort();
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.categoryId, (counts.get(entry.categoryId) ?? 0) + 1);
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">MOOCO Decks</h1>
          <p className="mt-1 text-sm opacity-60">
            {entries.length} entries indexed
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5"
        >
          Add to the index
        </Link>
      </header>

      <form className="mt-8 flex gap-2">
        {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
        {filters.category && (
          <input type="hidden" name="category" value={filters.category} />
        )}
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Search by name, description or tag"
          aria-label="Search the index"
          className="w-full rounded-md border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-current/50"
        />
        <button
          type="submit"
          className="rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5"
        >
          Search
        </button>
      </form>

      <CategoryNav groups={groupCategories(categories)} filters={filters} counts={counts} />

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filter by tag">
        {tags.map((name) => (
          <FilterChip
            key={name}
            href={toggleHref(filters, "tag", name)}
            active={filters.tag === name}
          >
            {name}
          </FilterChip>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="mt-12 text-sm opacity-60">
          Nothing matches this search.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-current/10 border-y border-current/10">
          {visible.map((entry) => (
            <li key={entry.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <EntryTitle entry={entry} />
                <div className="flex gap-3 text-sm">
                  <EntryActions entry={entry} />
                </div>
              </div>

              {entry.description && (
                <p className="mt-1 text-sm opacity-70">{entry.description}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs opacity-60">
                <span className="font-medium">{categoryNames.get(entry.categoryId)}</span>
                {entry.type === "asset" && <span className={badgeClass}>asset</span>}
                {entry.visibility === "internal" && (
                  <span className={badgeClass}>internal</span>
                )}
                {entry.tags.join(" · ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
