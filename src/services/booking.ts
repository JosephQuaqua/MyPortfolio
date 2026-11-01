import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

export interface BookableType {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_amount: number | null;
  currency: string | null;
}

export interface OpenSlot {
  starts_at: string;
  ends_at: string;
}

export interface BookingInput {
  consultationTypeId: string;
  startsAt: string;
  clientName: string;
  clientEmail: string;
  clientNotes: string | null;
}

const VALIDATION_ERROR_CODE = "22023";

export async function listBookableTypes(): Promise<BookableType[]> {
  const { data, error } = await supabase
    .from("consultation_types")
    .select("id, name, description, duration_minutes, price_amount, currency")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw toServiceError("Consultation types could not be loaded.", error);
  return data ?? [];
}

export async function listOpenSlots(consultationTypeId: string, date: string): Promise<OpenSlot[]> {
  const { data, error } = await supabase.rpc("get_consultation_slots", {
    p_type_id: consultationTypeId,
    p_date: date,
  });
  if (error) throw toServiceError("Available times could not be loaded.", error);
  return data ?? [];
}

export async function createConsultationBooking(input: BookingInput): Promise<void> {
  const { error } = await supabase.rpc("create_consultation_booking", {
    p_type_id: input.consultationTypeId,
    p_starts_at: input.startsAt,
    p_client_name: input.clientName,
    p_client_email: input.clientEmail,
    p_client_notes: input.clientNotes,
  });
  if (!error) return;
  if (error.code === VALIDATION_ERROR_CODE) throw new Error(error.message);
  throw toServiceError("Your booking could not be completed. Please try again.", error);
}
