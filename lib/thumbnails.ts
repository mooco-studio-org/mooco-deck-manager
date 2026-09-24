import sharp from "sharp";
import { supabase } from "./supabase";

const BUCKET = "thumbnails";

// Same output as the reference index's thumbnails: 800px wide WebP at quality 75. Cards
// crop to 16:10 from the top, so only the width is fixed.
export async function toThumbnailWebp(file: File): Promise<Buffer> {
  return sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 75, effort: 6 })
    .toBuffer();
}

export async function uploadThumbnail(webp: Buffer): Promise<string> {
  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, webp, { contentType: "image/webp", cacheControl: "31536000" });

  if (error) {
    throw error;
  }
  return path;
}

export async function deleteThumbnail(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw error;
  }
}

export function thumbnailUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
