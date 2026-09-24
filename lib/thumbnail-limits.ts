// Shared by the form, which checks before uploading, and the Server Action, which is the
// real boundary. Kept apart from lib/thumbnails.ts, which pulls in sharp and the secret key.
export const THUMBNAIL_MAX_BYTES = 4 * 1024 * 1024;
export const THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];
