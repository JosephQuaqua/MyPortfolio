import { supabase } from "../lib/supabase";
import type { SkillCategoryRow, SkillGroup, SkillRow } from "../types/cms";
import { sortByDisplayOrder, toServiceError } from "./errors";

export async function fetchSkillGroups(): Promise<SkillGroup[]> {
  const [categoriesResult, skillsResult] = await Promise.all([
    supabase.from("skill_categories").select("id, name, display_order").order("display_order", { ascending: true }),
    supabase
      .from("skills")
      .select("id, category_id, name, icon_url, proficiency_label, learning_period, display_order, is_featured")
      .order("display_order", { ascending: true }),
  ]);
  if (categoriesResult.error) throw toServiceError("Skills could not be loaded.", categoriesResult.error);
  if (skillsResult.error) throw toServiceError("Skills could not be loaded.", skillsResult.error);

  const skills = (skillsResult.data ?? []) as SkillRow[];
  const categories = sortByDisplayOrder((categoriesResult.data ?? []) as SkillCategoryRow[]);

  return categories
    .map((category) => ({
      ...category,
      skills: skills.filter((skill) => skill.category_id === category.id),
    }))
    .filter((group) => group.skills.length > 0);
}
