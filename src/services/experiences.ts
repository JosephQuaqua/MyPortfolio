import { supabase } from "../lib/supabase";
import type { ExperienceRow } from "../types/cms";
import { sortByDisplayOrder, toServiceError } from "./errors";

export async function fetchExperiences(): Promise<ExperienceRow[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw toServiceError("Experience could not be loaded.", error);
  }

  return sortByDisplayOrder((data ?? []) as ExperienceRow[]);
}

export async function fetchExperienceById(
  id: string
): Promise<ExperienceRow> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error) {
    throw toServiceError("Experience could not be loaded.", error);
  }

  return data as ExperienceRow;
}