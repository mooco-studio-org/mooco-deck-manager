import Link from "next/link";
import type { Metadata } from "next";
import { groupCategories, listCategories } from "@/lib/categories";
import { NewEntryForm } from "./form";

export const metadata: Metadata = {
  title: "Nueva entrada",
};

// Styled after the reference's add dialog: a card over a muted ground, rather than a
// modal over the index, so /new stays a plain page.
export default async function NewEntryPage() {
  const categoryGroups = groupCategories(await listCategories());

  return (
    <main className="flex flex-1 justify-center bg-surface-alt px-4 py-10 sm:py-16">
      <div className="h-fit w-full max-w-[520px] rounded-[20px] border border-line bg-page shadow-[0_40px_80px_rgba(0,0,0,0.12)]">
        <div className="flex items-baseline justify-between border-b border-line px-7 pt-6 pb-5">
          <h1 className="text-2xl leading-[1.1] font-extrabold tracking-[-0.02em]">
            Nueva entrada
          </h1>
          <Link href="/" aria-label="Cerrar" className="p-1 text-ink-muted hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Link>
        </div>
        <NewEntryForm categoryGroups={categoryGroups} />
      </div>
    </main>
  );
}
