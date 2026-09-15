import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { getPresentationBySlug } from "@/lib/presentations";
import { embedUrl } from "@/lib/google-slides";

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
    <iframe
      title={presentation.title}
      src={embedUrl(presentation.publishedId)}
      allow="autoplay; fullscreen"
      allowFullScreen
      className="fixed inset-0 h-full w-full border-0 bg-[#1c1c1c]"
    />
  );
}
