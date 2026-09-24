import type { ReactNode } from "react";
import type { Entry } from "@/lib/presentations";
import { editorUrl } from "@/lib/google-slides";

// Placeholder backgrounds from the reference, picked by a hash of the title so each entry
// keeps the same one across renders. Thumbnails will be layered on top of this.
const GRADIENTS = [
  ["#1c1c1b", "#2a2a28"],
  ["#1a2028", "#0d1218"],
  ["#28221c", "#181410"],
  ["#1e2820", "#111a13"],
  ["#241c26", "#141018"],
  ["#292620", "#181614"],
  ["#1a2528", "#0f181a"],
  ["#28201a", "#181310"],
];

function gradientFor(title: string): string {
  let hash = 0;
  for (const char of title) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

function initialOf(title: string): string {
  return title.match(/\p{L}/u)?.[0].toUpperCase() ?? "◆";
}

function Thumbnail({ title }: { title: string }) {
  return (
    <div
      className="relative grid aspect-[16/10] place-items-center overflow-hidden"
      style={{ background: gradientFor(title) }}
    >
      <span className="absolute top-3.5 left-4 text-[9.5px] font-bold tracking-[0.18em] text-white/85 uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
        <span className="mr-1.5 text-[8px] opacity-70">◆</span>MOOCO
      </span>
      <span
        aria-hidden="true"
        className="text-[clamp(80px,12vw,128px)] leading-none font-extrabold tracking-[-0.04em] text-white/15 select-none"
      >
        {initialOf(title)}
      </span>
    </div>
  );
}

const bubbleBase =
  "inline-flex items-center gap-1 rounded-full border-[1.5px] px-3.5 py-[7px] text-xs leading-none whitespace-nowrap transition-colors";

function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${bubbleBase} border-accent bg-accent font-semibold text-black hover:border-accent-hover hover:bg-accent-hover`}
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function SecondaryAction({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${bubbleBase} gap-1.5 border-dashed border-card-line font-medium text-card-ink-faint`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-danger opacity-70">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${bubbleBase} border-card-line font-medium text-card-ink hover:border-card-ink hover:bg-card-ink hover:text-card`}
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function EntryActions({ entry }: { entry: Entry }) {
  if (entry.type === "asset") {
    return (
      <>
        <PrimaryAction href={entry.visitUrl}>Visitar</PrimaryAction>
        <SecondaryAction href={entry.fileUrl}>Archivo</SecondaryAction>
      </>
    );
  }

  return (
    <>
      <PrimaryAction href={`/${entry.slug}`}>Presentar</PrimaryAction>
      <SecondaryAction href={entry.fileId && editorUrl(entry.fileId)}>Editable</SecondaryAction>
    </>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-card-line bg-card-surface px-2.5 py-[3px] text-[10px] font-medium tracking-normal text-card-ink-muted normal-case">
      {children}
    </span>
  );
}

export function EntryCard({ entry, categoryName }: { entry: Entry; categoryName: string }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] bg-card text-card-ink transition-transform hover:-translate-y-0.5">
      <Thumbnail title={entry.title} />
      <div className="flex flex-1 flex-col gap-3 px-6 pt-[22px] pb-6">
        <div className="flex h-5 items-center justify-between gap-3 text-[10px] font-semibold tracking-[0.14em] text-card-ink-muted uppercase">
          <span>{categoryName}</span>
          <span className="flex gap-1.5">
            {entry.type === "asset" && <MetaPill>Asset</MetaPill>}
            {entry.visibility === "internal" && <MetaPill>Interna</MetaPill>}
          </span>
        </div>
        <h3 className="text-xl leading-[1.2] font-bold tracking-[-0.015em]">{entry.title}</h3>
        {entry.description ? (
          <p className="line-clamp-3 text-[13.5px] leading-normal text-card-ink-muted">
            {entry.description}
          </p>
        ) : (
          <p className="text-[13.5px] leading-normal text-card-ink-faint italic">
            Sin descripción todavía.
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3.5">
          <EntryActions entry={entry} />
        </div>
      </div>
    </article>
  );
}
