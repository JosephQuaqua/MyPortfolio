import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface ConsultationRecord {
  id: string;
  client_name: string;
  client_email: string;
  client_notes: string | null;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  admin_notes: string | null;
  consultation_types: { name: string } | null;
}

export async function listConsultations(): Promise<ConsultationRecord[]> {
  const { data, error } = await supabase
    .from("consultations")
    .select("id, client_name, client_email, client_notes, starts_at, ends_at, status, admin_notes, consultation_types(name)")
    .order("starts_at", { ascending: false });
  if (error) throw toServiceError("Bookings could not be loaded.", error);
  return (data ?? []) as unknown as ConsultationRecord[];
}

export async function updateConsultation(id: string, values: { status?: BookingStatus; admin_notes?: string | null }): Promise<void> {
  const { error } = await supabase.from("consultations").update(values).eq("id", id);
  if (error) throw toServiceError("The booking could not be updated.", error);
}
