import { supabase } from "../lib/supabase";
import type { ProfileRow, SiteSettingsRow, SocialLinkRow } from "../types/cms";
import { toServiceError } from "./errors";

export async function fetchSocialLinks(): Promise<SocialLinkRow[]> {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Social links could not be loaded.", error);
  return (data ?? []) as SocialLinkRow[];
}

export async function fetchProfile(): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from("profile").select("*").order("id").limit(1).maybeSingle();
  if (error) throw toServiceError("Profile details could not be loaded.", error);
  return data as ProfileRow | null;
}

export async function updateProfile(id: number, values: Partial<ProfileRow>): Promise<void> {
  const { error } = await supabase.from("profile").update(values).eq("id", id);
  if (error) throw toServiceError("Profile details could not be saved.", error);
}

export async function fetchSiteSettings(): Promise<SiteSettingsRow | null> {
  const { data, error } = await supabase.from("site_settings").select("*").order("id").limit(1).maybeSingle();
  if (error) throw toServiceError("Site settings could not be loaded.", error);
  return data as SiteSettingsRow | null;
}

export async function updateSiteSettings(id: number, values: Partial<SiteSettingsRow>): Promise<void> {
  const { error } = await supabase.from("site_settings").update(values).eq("id", id);
  if (error) throw toServiceError("Site settings could not be saved.", error);
}
