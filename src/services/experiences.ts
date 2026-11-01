import { supabase } from "../lib/supabase";
import type { ExperienceRow } from "../types/cms";
import { sortByDisplayOrder, toServiceError } from "./errors";

export async function fetchExperiences(): Promise<ExperienceRow[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Experience could not be loaded.", error);
  return sortByDisplayOrder((data ?? []) as ExperienceRow[]);
}
