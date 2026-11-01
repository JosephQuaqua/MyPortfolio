import { supabase } from "../lib/supabase";
import type { CertificationRow, EducationRow } from "../types/cms";
import { sortByDisplayOrder, toServiceError } from "./errors";

export async function fetchEducation(): Promise<EducationRow[]> {
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Education could not be loaded.", error);
  return sortByDisplayOrder((data ?? []) as EducationRow[]);
}

export async function fetchCertifications(): Promise<CertificationRow[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Certifications could not be loaded.", error);
  return sortByDisplayOrder((data ?? []) as CertificationRow[]);
}
