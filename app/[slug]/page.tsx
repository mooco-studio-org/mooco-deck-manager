import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { getPresentationBySlug } from "@/lib/presentations";

const dateFormat = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const presentation = await getPresentationBySlug(slug, await getViewer());

  if (!presentation) {
    return { title: "Not found" };
  }

  return {
    title: presentation.title,
    description: presentation.description ?? undefined,
  };
}

export default async function PresentationPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const presentation = await getPresentationBySlug(slug, await getViewer());

  if (!presentation) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100"
      >
        ← All decks
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {presentation.title}
      </h1>

      {presentation.description && (
        <p className="mt-2 opacity-70">{presentation.description}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={presentation.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5"
        >
          Open presentation
        </a>
        {presentation.editorUrl && (
          <a
            href={presentation.editorUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5"
          >
            Open in Google Slides
          </a>
        )}
      </div>

      <dl className="mt-10 grid gap-x-8 gap-y-4 border-t border-current/10 pt-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="opacity-60">Tags</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {presentation.tags.map((tag) => (
              <Link
                key={tag}
                href={{ pathname: "/", query: { tag } }}
                className="rounded-full border border-current/20 px-3 py-1 text-xs opacity-70 transition hover:opacity-100"
              >
                {tag}
              </Link>
            ))}
          </dd>
        </div>
        <div>
          <dt className="opacity-60">Visibility</dt>
          <dd className="mt-1">
            {presentation.visibility === "public"
              ? "Public — shareable outside the studio"
              : "Internal — MOOCO team only"}
          </dd>
        </div>
        <div>
          <dt className="opacity-60">Added</dt>
          <dd className="mt-1">
            {dateFormat.format(new Date(presentation.createdAt))}
          </dd>
        </div>
        <div>
          <dt className="opacity-60">Last updated</dt>
          <dd className="mt-1">
            {dateFormat.format(new Date(presentation.updatedAt))}
          </dd>
        </div>
      </dl>
    </main>
  );
}
