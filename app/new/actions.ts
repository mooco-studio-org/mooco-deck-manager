"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { createEntry, type EntryDraft, type Visibility } from "@/lib/presentations";
import { extractFileId, extractPublishedId } from "@/lib/google-slides";

export type FormState = {
  errors: Record<string, string>;
};

type Errors = Record<string, string>;

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

function readDraft(formData: FormData): { draft: EntryDraft } | { errors: Errors } {
  const errors: Errors = {};
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

  // The required ids and URLs are only ever null alongside an error, but narrowing them
  // here keeps the drafts free of a cast.
  if (type === "deck") {
    const { publishedId, fileId } = readDeckIds(formData, errors);
    return Object.keys(errors).length > 0 || !publishedId
      ? { errors }
      : { draft: { ...common, type, publishedId, fileId } };
  }

  const { visitUrl, fileUrl } = readAssetUrls(formData, errors);
  return Object.keys(errors).length > 0 || !visitUrl
    ? { errors }
    : { draft: { ...common, type, visitUrl, fileUrl } };
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

  const result = readDraft(formData);
  if ("errors" in result) {
    return { errors: result.errors };
  }

  const entry = await createEntry(result.draft, viewer);

  // redirect() throws a control-flow exception, so revalidation has to happen first.
  revalidatePath("/");
  redirect(entry.type === "deck" ? `/${entry.slug}` : "/");
}
