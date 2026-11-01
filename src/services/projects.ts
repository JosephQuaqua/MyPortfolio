import { supabase } from "../lib/supabase";
import type { ProjectWithDetails } from "../types/cms";
import { sortByDisplayOrder, toServiceError } from "./errors";

const PROJECT_SELECT = "*, project_technologies(id, name, display_order), project_images(id, image_url, alt_text, caption, display_order)";

function normalizeProject(project: ProjectWithDetails): ProjectWithDetails {
  return {
    ...project,
    key_features: project.key_features ?? [],
    technical_contributions: project.technical_contributions ?? [],
    project_technologies: sortByDisplayOrder(project.project_technologies ?? []),
    project_images: sortByDisplayOrder(project.project_images ?? []),
  };
}

export async function fetchPublishedProjects(): Promise<ProjectWithDetails[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Projects could not be loaded.", error);
  return sortByDisplayOrder(((data ?? []) as ProjectWithDetails[]).map(normalizeProject));
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectWithDetails | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw toServiceError("This project could not be loaded.", error);
  return data ? normalizeProject(data as ProjectWithDetails) : null;
}
