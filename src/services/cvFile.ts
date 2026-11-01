import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

const CV_BUCKET = "documents";
const CV_FILE_NAME = "cv.pdf";
const CV_MAX_BYTES = 10 * 1024 * 1024;
const CV_LINK_SECONDS = 60 * 60;

async function createCvLink(): Promise<string | null> {
  const { data, error } = await supabase.storage.from(CV_BUCKET).createSignedUrl(CV_FILE_NAME, CV_LINK_SECONDS);
  if (error) {
    console.error("The CV link could not be created.", error);
    return null;
  }
  return data.signedUrl;
}

export async function fetchCvUrl(): Promise<string | null> {
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("cv_url, cv_is_published")
    .maybeSingle();
  if (error) {
    console.error("The CV could not be loaded.", error);
    throw new Error("The CV could not be loaded.");
  }
  if (!settings?.cv_is_published || !settings.cv_url) return null;
  return createCvLink();
}

export async function fetchStoredCvUrl(cvPath: string | null): Promise<string | null> {
  if (!cvPath) return null;
  return createCvLink();
}

export async function uploadCv(file: File): Promise<string> {
  if (file.type !== "application/pdf") throw new Error("Upload a PDF file.");
  if (file.size > CV_MAX_BYTES) throw new Error("The CV must be 10 MB or smaller.");
  const { error } = await supabase.storage.from(CV_BUCKET).upload(CV_FILE_NAME, file, {
    contentType: "application/pdf",
    upsert: true,
    cacheControl: "60",
  });
  if (error) throw toServiceError("The CV could not be uploaded.", error);
  return CV_FILE_NAME;
}

export async function deleteCv(): Promise<void> {
  const { error } = await supabase.storage.from(CV_BUCKET).remove([CV_FILE_NAME]);
  if (error) throw toServiceError("The CV could not be deleted.", error);
}
