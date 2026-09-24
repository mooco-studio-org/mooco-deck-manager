"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import {
  createEntry,
  type EntryDraft,
  type Viewer,
  type Visibility,
} from "@/lib/presentations";
import { findOrCreateCategory, listCategories } from "@/lib/categories";
import { extractFileId, extractPublishedId } from "@/lib/google-slides";

export type FormState = {
  errors: Record<string, string>;
};

type Errors = Record<string, string>;

// The select's sentinel for "create a category from the text field instead".
const NEW_CATEGORY = "new";

type CategoryChoice = { id: string } | { newName: string };

// A new category is only created once the rest of the form is valid, so the draft
// travels without its categoryId until then.
type Uncategorized<T> = T extends unknown ? Omit<T, "categoryId"> : never;

type Pending = { draft: Uncategorized<EntryDraft>; category: CategoryChoice };

function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(raw: string): string[] {
  const tags = raw
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)];
}

// Asset URLs end up in an href on the index, so anything but https — `javascript:` above
// all — is rejected here rather than escaped later.
function parseHttpsUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function readDeckIds(formData: FormData, errors: Errors) {
  const publishedLink = readText(formData, "publishedLink");
  const editorLink = readText(formData, "editorLink");

  const publishedId = extractPublishedId(publishedLink);
  if (!publishedLink) {
    errors.publishedLink = "The published link is required.";
  } else if (!publishedId) {
    // Pasting the editor link here would render a Google sign-in wall for clients.
    errors.publishedLink = extractFileId(publishedLink)
      ? "That is the editor link. Use File → Share → Publish to web and paste the link it gives you."
      : "No published presentation id found in that link.";
  }

  const fileId = editorLink ? extractFileId(editorLink) : null;
  if (editorLink && !fileId) {
    errors.editorLink = extractPublishedId(editorLink)
      ? "That is the published link. Paste the address bar URL from the open presentation."
      : "No presentation id found in that link.";
  }

  return { publishedId, fileId };
}

function readAssetUrls(formData: FormData, errors: Errors) {
  const visitLink = readText(formData, "visitLink");
  const fileLink = readText(formData, "fileLink");

  const visitUrl = parseHttpsUrl(visitLink);
  if (!visitLink) {
    errors.visitLink = "The visit link is required.";
  } else if (!visitUrl) {
    errors.visitLink = "Paste a full link starting with https://.";
  }

  const fileUrl = fileLink ? parseHttpsUrl(fileLink) : null;
  if (fileLink && !fileUrl) {
    errors.fileLink = "Paste a full link starting with https://.";
  }

  return { visitUrl, fileUrl };
}

function readCategory(
  formData: FormData,
  knownIds: Set<string>,
  errors: Errors,
): CategoryChoice | null {
  const selected = readText(formData, "category");

  if (selected === NEW_CATEGORY) {
    const newName = readText(formData, "newCategory");
    if (!newName) {
      errors.newCategory = "Name the new category.";
      return null;
    }
    return { newName };
  }

  if (!knownIds.has(selected)) {
    errors.category = "Pick a category.";
    return null;
  }
  return { id: selected };
}

function readDraft(
  formData: FormData,
  knownCategoryIds: Set<string>,
): Pending | { errors: Errors } {
  const errors: Errors = {};
  const category = readCategory(formData, knownCategoryIds, errors);
  const type = readText(formData, "type");
  const title = readText(formData, "title");
  const visibility = readText(formData, "visibility") as Visibility;

  if (!title) {
    errors.title = "A title is required.";
  }
  if (visibility !== "internal" && visibility !== "public") {
    errors.visibility = "Pick a visibility.";
  }
  if (type !== "deck" && type !== "asset") {
    return { errors: { ...errors, type: "Pick a type." } };
  }

  const common = {
    title,
    description: readText(formData, "description") || null,
    tags: parseTags(readText(formData, "tags")),
    visibility,
  };

  // The category and the required ids and URLs are only ever null alongside an error,
  // but narrowing them here keeps the drafts free of a cast.
  if (type === "deck") {
    const { publishedId, fileId } = readDeckIds(formData, errors);
    return Object.keys(errors).length > 0 || !publishedId || !category
      ? { errors }
      : { draft: { ...common, type, publishedId, fileId }, category };
  }

  const { visitUrl, fileUrl } = readAssetUrls(formData, errors);
  return Object.keys(errors).length > 0 || !visitUrl || !category
    ? { errors }
    : { draft: { ...common, type, visitUrl, fileUrl }, category };
}

async function resolveCategoryId(
  choice: CategoryChoice,
  viewer: Viewer,
): Promise<string> {
  if ("id" in choice) {
    return choice.id;
  }
  const category = await findOrCreateCategory(choice.newName, viewer);
  return category.id;
}

export async function registerEntry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Server Actions are POST endpoints reachable directly, so the page guard is not enough.
  const viewer = await getViewer();
  if (!viewer.isTeamMember) {
    return { errors: { form: "You are not allowed to register entries." } };
  }

  const categories = await listCategories();
  const result = readDraft(formData, new Set(categories.map((category) => category.id)));
  if ("errors" in result) {
    return { errors: result.errors };
  }

  const categoryId = await resolveCategoryId(result.category, viewer);
  const entry = await createEntry({ ...result.draft, categoryId }, viewer);

  // redirect() throws a control-flow exception, so revalidation has to happen first.
  revalidatePath("/");
  redirect(entry.type === "deck" ? `/${entry.slug}` : "/");
}
