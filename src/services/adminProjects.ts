import { supabase } from "../lib/supabase";
import type { ProjectWritePayload, AdminProjectDetail, AdminProjectListItem } from "../types/admin";
import type { PublicationStatus } from "../types/cms";
import { sortByDisplayOrder, toServiceError } from "./errors";

const LIST_SELECT =
  "id, slug, title, category, project_status, publication_status, is_featured, display_order, year, role, live_url, github_url";
const DETAIL_SELECT = "*, project_technologies(id, name, display_order)";

export class DuplicateSlugError extends Error {}

export async function fetchAdminProjects(): Promise<AdminProjectListItem[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(LIST_SELECT)
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Projects could not be loaded.", error);
  return sortByDisplayOrder((data ?? []) as AdminProjectListItem[]);
}

export async function fetchAdminProject(id: string): Promise<AdminProjectDetail | null> {
  const { data, error } = await supabase.from("projects").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw toServiceError("This project could not be loaded.", error);
  return (data as AdminProjectDetail | null) ?? null;
}

async function nextDisplayOrder(): Promise<number> {
  const { data, error } = await supabase
    .from("projects")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw toServiceError("The project order could not be read.", error);
  return data ? data.display_order + 1 : 1;
}

async function syncTechnologies(projectId: string, names: string[]): Promise<void> {
  const { data, error: readError } = await supabase
    .from("project_technologies")
    .select("id, name")
    .eq("project_id", projectId);
  if (readError) throw toServiceError("Technologies could not be saved.", readError);

  const wanted = new Set(names);
  const removedIds = (data ?? []).filter((row) => !wanted.has(row.name)).map((row) => row.id);
  if (removedIds.length > 0) {
    const { error } = await supabase.from("project_technologies").delete().in("id", removedIds);
    if (error) throw toServiceError("Technologies could not be saved.", error);
  }

  if (names.length > 0) {
    const rows = names.map((name, index) => ({ project_id: projectId, name, display_order: index + 1 }));
    const { error } = await supabase
      .from("project_technologies")
      .upsert(rows, { onConflict: "project_id,name" });
    if (error) throw toServiceError("Technologies could not be saved.", error);
  }
}

function assertNotDuplicateSlug(error: { code?: string }) {
  if (error.code === "23505") {
    throw new DuplicateSlugError("Another project already uses this slug. Choose a different slug.");
  }
}

export async function createProject(payload: ProjectWritePayload, technologies: string[]): Promise<string> {
  const display_order = await nextDisplayOrder();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, display_order })
    .select("id")
    .single();
  if (error) {
    assertNotDuplicateSlug(error);
    throw toServiceError("The project could not be created.", error);
  }
  await syncTechnologies(data.id, technologies);
  return data.id;
}

export async function updateProject(id: string, payload: ProjectWritePayload, technologies: string[]): Promise<void> {
  const { error } = await supabase.from("projects").update(payload).eq("id", id);
  if (error) {
    assertNotDuplicateSlug(error);
    throw toServiceError("The project could not be saved.", error);
  }
  await syncTechnologies(id, technologies);
}

export async function setProjectPublicationStatus(id: string, status: PublicationStatus): Promise<void> {
  const { error } = await supabase.from("projects").update({ publication_status: status }).eq("id", id);
  if (error) throw toServiceError("The project status could not be changed.", error);
}

export async function setProjectFeatured(id: string, isFeatured: boolean): Promise<void> {
  const { error } = await supabase.from("projects").update({ is_featured: isFeatured }).eq("id", id);
  if (error) throw toServiceError("The featured setting could not be changed.", error);
}

export async function swapProjectOrder(
  first: { id: string; display_order: number },
  second: { id: string; display_order: number },
): Promise<void> {
  const { error: firstError } = await supabase
    .from("projects")
    .update({ display_order: second.display_order })
    .eq("id", first.id);
  if (firstError) throw toServiceError("The project order could not be changed.", firstError);

  const { error: secondError } = await supabase
    .from("projects")
    .update({ display_order: first.display_order })
    .eq("id", second.id);
  if (secondError) throw toServiceError("The project order could not be changed.", secondError);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw toServiceError("The project could not be deleted.", error);
}
