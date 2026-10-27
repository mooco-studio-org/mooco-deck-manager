import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { getDeckAccess } from "@/lib/presentations";
import { embedUrl } from "@/lib/google-slides";
import { loginPath } from "@/app/login/next-path";
import { UnlockForm } from "./unlock-form";

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const access = await getDeckAccess(slug, await getViewer());

  switch (access.status) {
    case "open":
      return { title: access.deck.title, description: access.deck.description ?? undefined };
    case "locked":
      return { title: access.title };
    case "missing":
      return { title: "No encontrada" };
  }
}

export default async function DeckPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const viewer = await getViewer();
  const access = await getDeckAccess(slug, viewer);

  if (access.status === "locked") {
    return <UnlockForm slug={slug} title={access.title} signedIn={viewer.email !== null} />;
  }

  // A visitor who has not signed in is sent to log in whether the deck exists or not, so the
  // redirect never reveals which slugs are real. Once signed in, a missing deck and one
  // they may not open look the same.
  if (access.status === "missing" && !viewer.email) {
    redirect(loginPath(`/${slug}`));
  }
  if (access.status === "missing") {
    notFound();
  }

  return (
    <iframe
      title={access.deck.title}
      src={embedUrl(access.deck.publishedId)}
      allow="autoplay; fullscreen"
      allowFullScreen
      className="fixed inset-0 h-full w-full border-0 bg-[#1c1c1c]"
    />
  );
}
