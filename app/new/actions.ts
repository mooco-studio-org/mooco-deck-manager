"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { createPresentation, type Visibility } from "@/lib/presentations";

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
  const embedUrl = readText(formData, "embedUrl");
  const editorUrl = readText(formData, "editorUrl");
  const description = readText(formData, "description");
  const visibility = readText(formData, "visibility") as Visibility;

  const errors: Record<string, string> = {};
  if (!title) {
    errors.title = "A title is required.";
  }
  if (!embedUrl) {
    errors.embedUrl = "The published embed link is required.";
  } else if (!URL.canParse(embedUrl)) {
    errors.embedUrl = "This does not look like a valid URL.";
  } else if (embedUrl.includes("/edit")) {
    // Pasting the editor link here renders a Google sign-in wall for clients.
    errors.embedUrl =
      "That is the editor link. Use File → Share → Publish to web → Embed and paste the pubembed link.";
  }
  if (editorUrl && !URL.canParse(editorUrl)) {
    errors.editorUrl = "This does not look like a valid URL.";
  }
  if (visibility !== "internal" && visibility !== "public") {
    errors.visibility = "Pick a visibility.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const presentation = await createPresentation(
    {
      title,
      description: description || null,
      embedUrl,
      editorUrl: editorUrl || null,
      tags: parseTags(readText(formData, "tags")),
      visibility,
    },
    viewer,
  );

  // redirect() throws a control-flow exception, so revalidation has to happen first.
  revalidatePath("/");
  redirect(`/${presentation.slug}`);
}
