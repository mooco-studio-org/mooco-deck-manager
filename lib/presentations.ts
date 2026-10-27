import { cache } from "react";
import { slugify } from "./slug";
import { supabase } from "./supabase";
import { isUnlocked, rememberUnlock, sameSecret } from "./deck-unlock";

export type Visibility = "internal" | "public" | "restricted";

type EntryBase = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  tags: string[];
  visibility: Visibility;
  thumbnailPath: string | null;
  // Whether a client can open it with a password. The password itself stays in lib/.
  hasPassword: boolean;
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

// `email` is null for a visitor who has not signed in. Team membership comes from the email
// domain; admins are listed in the admins table.
export type Viewer = {
  email: string | null;
  isTeamMember: boolean;
  isAdmin: boolean;
};

type DraftOf<T extends Entry> = Omit<
  T,
  "id" | "createdAt" | "updatedAt" | "slug" | "hasPassword"
>;

// Who can open an entry beyond what its visibility grants: the emails on a restricted
// entry's list, and a password clients can type to open a non-public deck.
export type Protection = {
  access: string[];
  password: string | null;
};

export type EntryDraft = DraftOf<Deck> | DraftOf<Asset>;

// The database check constraints guarantee each type carries its own columns, which is
// what makes the non-null assertions in toEntry safe.
type EntryRow = {
  id: string;
  category_id: string;
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
  thumbnail_path: string | null;
  access_password: string | null;
  created_at: string;
  updated_at: string;
};

function toEntry(row: EntryRow): Entry {
  const base = {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    tags: row.tags,
    visibility: row.visibility,
    thumbnailPath: row.thumbnail_path,
    hasPassword: row.access_password !== null,
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
  password: string | null,
): Omit<EntryRow, "id" | "created_at" | "updated_at"> {
  const common = {
    category_id: draft.categoryId,
    type: draft.type,
    slug,
    title: draft.title,
    description: draft.description,
    tags: draft.tags,
    visibility: draft.visibility,
    thumbnail_path: draft.thumbnailPath,
    access_password: password,
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

// Public entries are open to anyone. Internal ones need a MOOCO account. Restricted ones
// need the viewer's email on the entry's access list — being on the team is not enough —
// unless the viewer is an admin.
function canView(entry: Entry, viewer: Viewer, granted: Set<string>): boolean {
  switch (entry.visibility) {
    case "public":
      return true;
    case "internal":
      return viewer.isTeamMember || viewer.isAdmin;
    case "restricted":
      return viewer.isAdmin || granted.has(entry.id);
  }
}

async function grantedEntryIds(viewer: Viewer, entryIds?: string[]): Promise<Set<string>> {
  if (!viewer.email) {
    return new Set();
  }

  let query = supabase.from("entry_access").select("entry_id").eq("email", viewer.email);
  if (entryIds) {
    query = query.in("entry_id", entryIds);
  }

  const { data, error } = await query.overrideTypes<{ entry_id: string }[], { merge: false }>();
  if (error) {
    throw error;
  }
  return new Set(data.map((row) => row.entry_id));
}

type FoundDeck = { deck: Deck; password: string | null };

// generateMetadata and the page both look the deck up; cache() collapses that into one
// query per request.
const findDeck = cache(async (slug: string): Promise<FoundDeck | null> => {
  const { data, error } = await supabase
    .from("entries")
    .select()
    .eq("type", "deck")
    .eq("slug", slug)
    .maybeSingle<EntryRow>();

  if (error) {
    throw error;
  }
  return data ? { deck: toEntry(data) as Deck, password: data.access_password } : null;
});

// Static routes are matched before /[slug], so a deck given one of these slugs would be
// unreachable. Keep in step with the top-level folders in app/.
const RESERVED_SLUGS = ["new", "login", "auth"];

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

  const taken = new Set([...RESERVED_SLUGS, ...data.map((row) => row.slug)]);
  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

async function adminOnlyCategoryIds(viewer: Viewer): Promise<Set<string>> {
  if (viewer.isAdmin) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("admin_only", true)
    .overrideTypes<{ id: string }[], { merge: false }>();

  if (error) {
    throw error;
  }
  return new Set(data.map((row) => row.id));
}

// Entries in an admin-only category are left out for non-admins whatever their own
// visibility: the category is hidden from the index as a whole. Opening a deck by its link
// is decided by getDeckAccess, which looks at the deck alone.
export async function listEntries(viewer: Viewer): Promise<Entry[]> {
  const [{ data, error }, granted, hiddenCategories] = await Promise.all([
    supabase
      .from("entries")
      .select()
      .order("updated_at", { ascending: false })
      .overrideTypes<EntryRow[], { merge: false }>(),
    grantedEntryIds(viewer),
    adminOnlyCategoryIds(viewer),
  ]);

  if (error) {
    throw error;
  }
  return data
    .map(toEntry)
    .filter((entry) => !hiddenCategories.has(entry.categoryId))
    .filter((entry) => canView(entry, viewer, granted));
}

// "locked" means the viewer may not open the deck but a password would let them in, so the
// page asks for it instead of answering 404.
export type DeckAccess =
  | { status: "open"; deck: Deck }
  | { status: "locked"; title: string }
  | { status: "missing" };

export async function getDeckAccess(slug: string, viewer: Viewer): Promise<DeckAccess> {
  const found = await findDeck(slug);
  if (!found) {
    return { status: "missing" };
  }

  const { deck, password } = found;
  const granted =
    deck.visibility === "restricted" ? await grantedEntryIds(viewer, [deck.id]) : new Set<string>();
  if (canView(deck, viewer, granted)) {
    return { status: "open", deck };
  }
  if (password === null) {
    return { status: "missing" };
  }
  return (await isUnlocked(deck.id, password))
    ? { status: "open", deck }
    : { status: "locked", title: deck.title };
}

// On success the browser is remembered, so the password is asked once per device.
export async function unlockDeck(slug: string, attempt: string): Promise<boolean> {
  const found = await findDeck(slug);
  if (!found?.password || !sameSecret(attempt, found.password)) {
    return false;
  }
  await rememberUnlock(found.deck.id, found.password);
  return true;
}

async function grantAccess(entryId: string, emails: string[]): Promise<void> {
  const { error } = await supabase
    .from("entry_access")
    .insert(emails.map((email) => ({ entry_id: entryId, email })));

  if (error) {
    throw error;
  }
}

async function deleteEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from("entries").delete().eq("id", entryId);
  if (error) {
    throw error;
  }
}

// The access list only matters for restricted entries. The creator is always added, so
// whoever registers a restricted entry can still open it without being an admin.
export async function createEntry(
  draft: EntryDraft,
  { access, password }: Protection,
  viewer: Viewer,
): Promise<Entry> {
  if (!viewer.isTeamMember || !viewer.email) {
    throw new Error("Only team members can register entries");
  }

  const slug = draft.type === "deck" ? await uniqueSlug(draft.title) : null;
  const { data, error } = await supabase
    .from("entries")
    .insert(toRow(draft, slug, password))
    .select()
    .single<EntryRow>();

  if (error) {
    throw error;
  }

  const entry = toEntry(data);
  if (entry.visibility === "restricted") {
    try {
      await grantAccess(entry.id, [...new Set([viewer.email, ...access])]);
    } catch (accessError) {
      // Without its access rows the entry would be visible to admins only; better that the
      // whole registration fails and can be retried.
      await deleteEntry(entry.id);
      throw accessError;
    }
  }
  return entry;
}
