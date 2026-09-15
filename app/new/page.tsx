import Link from "next/link";
import type { Metadata } from "next";
import { NewPresentationForm } from "./form";

export const metadata: Metadata = {
  title: "Register a deck",
};

export default function NewPresentationPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100"
      >
        ← All decks
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Register a deck</h1>
      <p className="mt-2 text-sm opacity-70">
        Add a presentation to the index. The deck gets its own page on this subdomain,
        ready to send to a client.
      </p>

      <NewPresentationForm />
    </main>
  );
}
