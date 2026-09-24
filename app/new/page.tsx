import Link from "next/link";
import type { Metadata } from "next";
import { groupCategories, listCategories } from "@/lib/categories";
import { NewEntryForm } from "./form";

export const metadata: Metadata = {
  title: "Add to the index",
};

export default async function NewPresentationPage() {
  const categoryGroups = groupCategories(await listCategories());

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100"
      >
        ← All decks
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Add to the index</h1>
      <p className="mt-2 text-sm opacity-70">
        A deck gets its own page on this subdomain, ready to send to a client. An asset
        is listed in the index and opens wherever it is hosted.
      </p>

      <NewEntryForm categoryGroups={categoryGroups} />
    </main>
  );
}
