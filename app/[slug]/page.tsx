import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { getDeckBySlug } from "@/lib/presentations";
import { embedUrl } from "@/lib/google-slides";

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const deck = await getDeckBySlug(slug, await getViewer());

  if (!deck) {
    return { title: "No encontrada" };
  }

  return {
    title: deck.title,
    description: deck.description ?? undefined,
  };
}

export default async function DeckPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const deck = await getDeckBySlug(slug, await getViewer());

  if (!deck) {
    notFound();
  }

  return (
    <iframe
      title={deck.title}
      src={embedUrl(deck.publishedId)}
      allow="autoplay; fullscreen"
      allowFullScreen
      className="fixed inset-0 h-full w-full border-0 bg-[#1c1c1c]"
    />
  );
}
