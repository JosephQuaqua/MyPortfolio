import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

export type TableRow = Record<string, unknown>;

export interface OrderColumn {
  column: string;
  ascending?: boolean;
}

export async function listRows<T>(table: string, select: string, message: string, order?: OrderColumn): Promise<T[]> {
  let query = supabase.from(table).select(select);
  if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
  const { data, error } = await query;
  if (error) throw toServiceError(message, error);
  return (data ?? []) as T[];
}

export interface CountFilter {
  eq?: Record<string, string | boolean>;
  gte?: { column: string; value: string };
}

export async function countRows(table: string, filter: CountFilter, message: string): Promise<number> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filter.eq ?? {})) {
    query = query.eq(column, value);
  }
  if (filter.gte) query = query.gte(filter.gte.column, filter.gte.value);
  const { count, error } = await query;
  if (error) throw toServiceError(message, error);
  return count ?? 0;
}

export async function insertRow(table: string, values: TableRow, message: string): Promise<void> {
  const { error } = await supabase.from(table).insert(values);
  if (error) throw toServiceError(message, error);
}

export async function updateRow(table: string, id: string, values: TableRow, message: string): Promise<void> {
  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) throw toServiceError(message, error);
}

export async function deleteRow(table: string, id: string, message: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw toServiceError(message, error);
}

export async function swapDisplayOrder(
  table: string,
  first: { id: string; display_order: number },
  second: { id: string; display_order: number },
  message: string,
): Promise<void> {
  await updateRow(table, first.id, { display_order: second.display_order }, message);
  await updateRow(table, second.id, { display_order: first.display_order }, message);
}
