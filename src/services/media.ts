import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

const MEDIA_BUCKET = "media";
const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string | null;
}

export async function listMedia(): Promise<MediaItem[]> {
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw toServiceError("The media library could not be loaded.", error);
  return (data ?? [])
    .filter((file) => file.id !== null)
    .map((file) => ({
      name: file.name,
      url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(file.name).data.publicUrl,
      size: Number((file.metadata as { size?: number } | null)?.size ?? 0),
      createdAt: file.created_at ?? null,
    }));
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  if (!MEDIA_TYPES.includes(file.type)) throw new Error("Upload a JPG, PNG, WebP, GIF, or SVG image.");
  if (file.size > MEDIA_MAX_BYTES) throw new Error("Images must be 10 MB or smaller.");
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const name = `${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(name, file, { contentType: file.type, cacheControl: "3600" });
  if (error) throw toServiceError("The image could not be uploaded.", error);
  return {
    name,
    url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(name).data.publicUrl,
    size: file.size,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteMedia(name: string): Promise<void> {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([name]);
  if (error) throw toServiceError("The image could not be deleted.", error);
}
