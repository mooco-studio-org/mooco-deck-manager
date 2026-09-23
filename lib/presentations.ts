import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
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

// The database check constraints guarantee each type carries its own columns, which is
// what makes the non-null assertions in toEntry safe.
type EntryRow = {
  id: string;
  type: "deck" | "asset";
  slug: string | null;
  title: string;
  description: string | null;
  published_id: string | null;
  file_id: string | null;
  visit_url: string | null;
  file_url: string | null;
  tags: string[];
  visibility: Visibility;
  created_at: string;
  updated_at: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

// The secret key bypasses row level security, so every read and write here is filtered
// by the app layer instead. It must never reach the browser — hence `server-only` above.
// Until Supabase Auth lands there is no user session to build a per-request client from.
const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SECRET_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function toEntry(row: EntryRow): Entry {
  const base = {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: row.tags,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.type === "asset") {
    return { ...base, type: "asset", visitUrl: row.visit_url!, fileUrl: row.file_url };
  }
  return {
    ...base,
    type: "deck",
    slug: row.slug!,
    publishedId: row.published_id!,
    fileId: row.file_id,
  };
}

function toRow(
  draft: EntryDraft,
  slug: string | null,
): Omit<EntryRow, "id" | "created_at" | "updated_at"> {
  const common = {
    type: draft.type,
    slug,
    title: draft.title,
    description: draft.description,
    tags: draft.tags,
    visibility: draft.visibility,
  };

  if (draft.type === "asset") {
    return {
      ...common,
      published_id: null,
      file_id: null,
      visit_url: draft.visitUrl,
      file_url: draft.fileUrl,
    };
  }
  return {
    ...common,
    published_id: draft.publishedId,
    file_id: draft.fileId,
    visit_url: null,
    file_url: null,
  };
}

function canView(entry: Entry, viewer: Viewer): boolean {
  return viewer.isTeamMember || entry.visibility === "public";
}

// generateMetadata and the page both look the deck up; cache() collapses that into one
// query per request.
const findDeck = cache(async (slug: string): Promise<Deck | null> => {
  const { data, error } = await supabase
    .from("entries")
    .select()
    .eq("type", "deck")
    .eq("slug", slug)
    .maybeSingle<EntryRow>();

  if (error) {
    throw error;
  }
  return data ? (toEntry(data) as Deck) : null;
});

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  const { data, error } = await supabase
    .from("entries")
    .select("slug")
    .or(`slug.eq.${base},slug.like.${base}-%`)
    .overrideTypes<{ slug: string }[], { merge: false }>();

  if (error) {
    throw error;
  }

  const taken = new Set(data.map((row) => row.slug));
  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export async function listEntries(viewer: Viewer): Promise<Entry[]> {
  let query = supabase.from("entries").select().order("updated_at", { ascending: false });
  if (!viewer.isTeamMember) {
    query = query.eq("visibility", "public");
  }

  const { data, error } = await query.overrideTypes<EntryRow[], { merge: false }>();
  if (error) {
    throw error;
  }
  return data.map(toEntry);
}

export async function getDeckBySlug(slug: string, viewer: Viewer): Promise<Deck | null> {
  const deck = await findDeck(slug);
  if (!deck || !canView(deck, viewer)) {
    return null;
  }
  return deck;
}

export async function createEntry(draft: EntryDraft, viewer: Viewer): Promise<Entry> {
  if (!viewer.isTeamMember) {
    throw new Error("Only team members can register entries");
  }

  const slug = draft.type === "deck" ? await uniqueSlug(draft.title) : null;
  const { data, error } = await supabase
    .from("entries")
    .insert(toRow(draft, slug))
    .select()
    .single<EntryRow>();

  if (error) {
    throw error;
  }
  return toEntry(data);
}
