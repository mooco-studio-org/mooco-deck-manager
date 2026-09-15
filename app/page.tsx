import Link from "next/link";
import { getViewer } from "@/lib/viewer";
import { listPresentations, type Presentation } from "@/lib/presentations";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function matches(presentation: Presentation, query: string, tag: string): boolean {
  const haystack = [
    presentation.title,
    presentation.description ?? "",
    ...presentation.tags,
  ]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes(query.toLowerCase()) &&
    (tag === "" || presentation.tags.includes(tag))
  );
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const query = readParam(params, "q");
  const tag = readParam(params, "tag");

  const viewer = await getViewer();
  const presentations = await listPresentations(viewer);
  const visible = presentations.filter((p) => matches(p, query, tag));

  const tags = [...new Set(presentations.flatMap((p) => p.tags))].sort();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">MOOCO Decks</h1>
          <p className="mt-1 text-sm opacity-60">
            {presentations.length} presentations indexed
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5"
        >
          Register a deck
        </Link>
      </header>

      <form className="mt-8 flex gap-2">
        {tag && <input type="hidden" name="tag" value={tag} />}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name, description or tag"
          aria-label="Search presentations"
          className="w-full rounded-md border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-current/50"
        />
        <button
          type="submit"
          className="rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5"
        >
          Search
        </button>
      </form>

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filter by tag">
        {tags.map((name) => {
          const active = name === tag;
          const href = active
            ? { pathname: "/", query: query ? { q: query } : {} }
            : { pathname: "/", query: query ? { q: query, tag: name } : { tag: name } };

          return (
            <Link
              key={name}
              href={href}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-current bg-current/10 font-medium"
                  : "border-current/20 opacity-70 hover:opacity-100"
              }`}
            >
              {name}
            </Link>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <p className="mt-12 text-sm opacity-60">
          No presentations match this search.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-current/10 border-y border-current/10">
          {visible.map((presentation) => (
            <li key={presentation.slug} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  href={`/${presentation.slug}`}
                  className="text-lg font-medium underline-offset-4 hover:underline"
                >
                  {presentation.title}
                </Link>
                <div className="flex gap-3 text-sm">
                  <a
                    href={`/${presentation.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 opacity-70 hover:opacity-100"
                  >
                    Present
                  </a>
                  {presentation.editorUrl && (
                    <a
                      href={presentation.editorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4 opacity-70 hover:opacity-100"
                    >
                      Edit
                    </a>
                  )}
                </div>
              </div>

              {presentation.description && (
                <p className="mt-1 text-sm opacity-70">{presentation.description}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs opacity-60">
                {presentation.visibility === "internal" && (
                  <span className="rounded-full border border-current/30 px-2 py-0.5">
                    internal
                  </span>
                )}
                {presentation.tags.join(" · ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
