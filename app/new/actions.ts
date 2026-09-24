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
import { deleteThumbnail, toThumbnailWebp, uploadThumbnail } from "@/lib/thumbnails";
import { THUMBNAIL_MAX_BYTES, THUMBNAIL_TYPES } from "@/lib/thumbnail-limits";

export type FormState = {
  errors: Record<string, string>;
};

type Errors = Record<string, string>;

// The select's sentinel for "create a category from the text field instead".
const NEW_CATEGORY = "new";

type CategoryChoice = { id: string } | { newName: string };

// A new category and the thumbnail upload only happen once the rest of the form is valid,
// so the draft travels without their ids until then.
// Omit applied to each member of a union, so the deck/asset discriminant survives.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type Pending = {
  draft: DistributiveOmit<EntryDraft, "categoryId" | "thumbnailPath">;
  category: CategoryChoice;
  thumbnail: File | null;
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
    errors.publishedLink = "El link publicado es obligatorio.";
  } else if (!publishedId) {
    // Pasting the editor link here would render a Google sign-in wall for clients.
    errors.publishedLink = extractFileId(publishedLink)
      ? "Ese es el link del editor. Usa Archivo → Compartir → Publicar en la Web y pega el link que te da."
      : "No se encontró una presentación publicada en ese link.";
  }

  const fileId = editorLink ? extractFileId(editorLink) : null;
  if (editorLink && !fileId) {
    errors.editorLink = extractPublishedId(editorLink)
      ? "Ese es el link publicado. Pega la URL de la barra del navegador con la presentación abierta."
      : "No se encontró una presentación en ese link.";
  }

  return { publishedId, fileId };
}

function readAssetUrls(formData: FormData, errors: Errors) {
  const visitLink = readText(formData, "visitLink");
  const fileLink = readText(formData, "fileLink");

  const visitUrl = parseHttpsUrl(visitLink);
  if (!visitLink) {
    errors.visitLink = "El link de visita es obligatorio.";
  } else if (!visitUrl) {
    errors.visitLink = "Pega un link completo que empiece por https://.";
  }

  const fileUrl = fileLink ? parseHttpsUrl(fileLink) : null;
  if (fileLink && !fileUrl) {
    errors.fileLink = "Pega un link completo que empiece por https://.";
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
      errors.newCategory = "Escribe el nombre de la nueva categoría.";
      return null;
    }
    return { newName };
  }

  if (!knownIds.has(selected)) {
    errors.category = "Elige una categoría.";
    return null;
  }
  return { id: selected };
}

function readThumbnail(formData: FormData, errors: Errors): File | null {
  const file = formData.get("thumbnail");
  // An empty file input still submits a File, with no name and no bytes.
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }
  if (!THUMBNAIL_TYPES.includes(file.type)) {
    errors.thumbnail = "La miniatura tiene que ser JPG, PNG o WebP.";
    return null;
  }
  if (file.size > THUMBNAIL_MAX_BYTES) {
    errors.thumbnail = "La miniatura no puede pesar más de 4 MB.";
    return null;
  }
  return file;
}

function readDraft(
  formData: FormData,
  knownCategoryIds: Set<string>,
): Pending | { errors: Errors } {
  const errors: Errors = {};
  const category = readCategory(formData, knownCategoryIds, errors);
  const thumbnail = readThumbnail(formData, errors);
  const type = readText(formData, "type");
  const title = readText(formData, "title");
  const visibility = readText(formData, "visibility") as Visibility;

  if (!title) {
    errors.title = "El nombre es obligatorio.";
  }
  if (visibility !== "internal" && visibility !== "public") {
    errors.visibility = "Elige la visibilidad.";
  }
  if (type !== "deck" && type !== "asset") {
    return { errors: { ...errors, type: "Elige el tipo." } };
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
      : { draft: { ...common, type, publishedId, fileId }, category, thumbnail };
  }

  const { visitUrl, fileUrl } = readAssetUrls(formData, errors);
  return Object.keys(errors).length > 0 || !visitUrl || !category
    ? { errors }
    : { draft: { ...common, type, visitUrl, fileUrl }, category, thumbnail };
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

async function createWithThumbnail(
  draft: DistributiveOmit<EntryDraft, "thumbnailPath">,
  webp: Buffer | null,
  viewer: Viewer,
) {
  const thumbnailPath = webp ? await uploadThumbnail(webp) : null;
  try {
    return await createEntry({ ...draft, thumbnailPath }, viewer);
  } catch (error) {
    if (thumbnailPath) {
      await deleteThumbnail(thumbnailPath);
    }
    throw error;
  }
}

export async function registerEntry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Server Actions are POST endpoints reachable directly, so the page guard is not enough.
  const viewer = await getViewer();
  if (!viewer.isTeamMember) {
    return { errors: { form: "No tienes permiso para añadir entradas." } };
  }

  const categories = await listCategories();
  const result = readDraft(formData, new Set(categories.map((category) => category.id)));
  if ("errors" in result) {
    return { errors: result.errors };
  }

  // Decoding happens before anything is written, so a file that only looks like an image
  // is rejected without leaving a category or an upload behind.
  let webp: Buffer | null = null;
  if (result.thumbnail) {
    try {
      webp = await toThumbnailWebp(result.thumbnail);
    } catch {
      return { errors: { thumbnail: "No se pudo leer la imagen. Prueba con otro archivo." } };
    }
  }

  const categoryId = await resolveCategoryId(result.category, viewer);
  const entry = await createWithThumbnail({ ...result.draft, categoryId }, webp, viewer);

  // redirect() throws a control-flow exception, so revalidation has to happen first.
  revalidatePath("/");
  redirect(entry.type === "deck" ? `/${entry.slug}` : "/");
}
