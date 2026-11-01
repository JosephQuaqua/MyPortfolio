import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

export interface ActivityRecord {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function listActivity(limit: number): Promise<ActivityRecord[]> {
  const { data, error } = await supabase
    .from("admin_activity_log")
    .select("id, actor_email, action, entity, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw toServiceError("Activity could not be loaded.", error);
  return (data ?? []) as ActivityRecord[];
}
