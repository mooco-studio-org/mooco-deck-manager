import { slugify } from "./slug";

export type Visibility = "internal" | "public";

type EntryBase = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
};

export type Deck = EntryBase & {
  type: "deck";
  slug: string;
  publishedId: string;
  fileId: string | null;
};

// Assets live outside Google Slides, so they are the one kind of entry that stores URLs.
export type Asset = EntryBase & {
  type: "asset";
  visitUrl: string;
  fileUrl: string | null;
};

export type Entry = Deck | Asset;

export type Viewer = {
  isTeamMember: boolean;
};

type DraftOf<T extends Entry> = Omit<T, "id" | "createdAt" | "updatedAt" | "slug">;

export type EntryDraft = DraftOf<Deck> | DraftOf<Asset>;

type SeedEntry = Omit<Deck, "id"> | Omit<Asset, "id">;

const seed: SeedEntry[] = [
  {
    type: "deck",
    slug: "mooco-studio-credentials",
    title: "MOOCO Studio Credentials",
    description: "Who we are, what we do, and the work we are proudest of.",
    publishedId: "2PACX-1vTcredentials0aBc",
    fileId: "1aBcCredentials",
    tags: ["credentials", "studio"],
    visibility: "public",
    createdAt: "2026-01-14T10:00:00.000Z",
    updatedAt: "2026-01-14T10:00:00.000Z",
  },
  {
    type: "deck",
    slug: "brand-strategy-framework",
    title: "Brand Strategy Framework",
    description: "The method we walk clients through in the discovery phase.",
    publishedId: "2PACX-1vTbrand0dEf",
    fileId: "2dEfBrand",
    tags: ["strategy", "branding", "method"],
    visibility: "public",
    createdAt: "2026-02-03T09:30:00.000Z",
    updatedAt: "2026-03-11T16:45:00.000Z",
  },
  {
    type: "deck",
    slug: "2026-rate-card",
    title: "2026 Rate Card",
    description: "Internal pricing reference. Not for client distribution.",
    publishedId: "2PACX-1vTrates0ghI",
    fileId: "3ghRates",
    tags: ["pricing"],
    visibility: "internal",
    createdAt: "2026-01-06T08:00:00.000Z",
    updatedAt: "2026-06-22T11:20:00.000Z",
  },
  {
    type: "asset",
    title: "Motion Reel Q2",
    description: null,
    visitUrl: "https://drive.google.com/file/d/7opMotionReel/view",
    fileUrl: null,
    tags: ["motion", "reel", "showcase"],
    visibility: "public",
    createdAt: "2026-04-18T14:10:00.000Z",
    updatedAt: "2026-04-18T14:10:00.000Z",
  },
  {
    type: "deck",
    slug: "onboarding-new-designers",
    title: "Onboarding New Designers",
    description: "Everything a designer needs in their first two weeks.",
    publishedId: "2PACX-1vTonboarding0klM",
    fileId: "5klOnboarding",
    tags: ["onboarding", "team"],
    visibility: "internal",
    createdAt: "2026-05-02T13:00:00.000Z",
    updatedAt: "2026-07-30T10:05:00.000Z",
  },
  {
    type: "deck",
    slug: "packaging-case-studies",
    title: "Packaging Case Studies",
    description: "Six packaging projects, with results.",
    publishedId: "2PACX-1vTpackaging0mnO",
    fileId: "6mnPackaging",
    tags: ["packaging", "case-study", "showcase"],
    visibility: "public",
    createdAt: "2026-08-09T15:40:00.000Z",
    updatedAt: "2026-08-09T15:40:00.000Z",
  },
];

const store = new Map<string, Entry>(
  seed.map((entry) => {
    const id = crypto.randomUUID();
    return [id, { ...entry, id }];
  }),
);

function canView(entry: Entry, viewer: Viewer): boolean {
  return viewer.isTeamMember || entry.visibility === "public";
}

function findDeck(slug: string): Deck | undefined {
  for (const entry of store.values()) {
    if (entry.type === "deck" && entry.slug === slug) {
      return entry;
    }
  }
  return undefined;
}

function uniqueSlug(title: string): string {
  const base = slugify(title);
  if (!findDeck(base)) {
    return base;
  }

  let suffix = 2;
  while (findDeck(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export async function listEntries(viewer: Viewer): Promise<Entry[]> {
  return [...store.values()]
    .filter((entry) => canView(entry, viewer))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDeckBySlug(slug: string, viewer: Viewer): Promise<Deck | null> {
  const deck = findDeck(slug);
  if (!deck || !canView(deck, viewer)) {
    return null;
  }
  return deck;
}

export async function createEntry(draft: EntryDraft, viewer: Viewer): Promise<Entry> {
  if (!viewer.isTeamMember) {
    throw new Error("Only team members can register entries");
  }

  const now = new Date().toISOString();
  const base = { id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  const entry: Entry =
    draft.type === "deck"
      ? { ...draft, ...base, slug: uniqueSlug(draft.title) }
      : { ...draft, ...base };

  store.set(entry.id, entry);
  return entry;
}
