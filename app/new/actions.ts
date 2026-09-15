"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { createPresentation, type Visibility } from "@/lib/presentations";
import { extractFileId, extractPublishedId } from "@/lib/google-slides";

export type FormState = {
  errors: Record<string, string>;
};

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

export async function registerPresentation(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Server Actions are POST endpoints reachable directly, so the page guard is not enough.
  const viewer = await getViewer();
  if (!viewer.isTeamMember) {
    return { errors: { form: "You are not allowed to register presentations." } };
  }

  const title = readText(formData, "title");
  const publishedLink = readText(formData, "publishedLink");
  const editorLink = readText(formData, "editorLink");
  const description = readText(formData, "description");
  const visibility = readText(formData, "visibility") as Visibility;

  const errors: Record<string, string> = {};
  if (!title) {
    errors.title = "A title is required.";
  }
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
  if (visibility !== "internal" && visibility !== "public") {
    errors.visibility = "Pick a visibility.";
  }

  // publishedId is only ever null alongside an error, but narrowing it here keeps the
  // draft free of a cast.
  if (Object.keys(errors).length > 0 || !publishedId) {
    return { errors };
  }

  const presentation = await createPresentation(
    {
      title,
      description: description || null,
      publishedId,
      fileId,
      tags: parseTags(readText(formData, "tags")),
      visibility,
    },
    viewer,
  );

  // redirect() throws a control-flow exception, so revalidation has to happen first.
  revalidatePath("/");
  redirect(`/${presentation.slug}`);
}
