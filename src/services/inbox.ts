import { supabase } from "../lib/supabase";
import { toServiceError } from "./errors";

export const MESSAGE_STATUSES = ["unread", "read", "archived"] as const;
export const INQUIRY_STATUSES = ["new", "contacted", "interviewing", "hired", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  admin_notes: string | null;
  created_at: string;
}

export interface HiringInquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  opportunity_type: string;
  position_title: string | null;
  project_description: string | null;
  budget_range: string | null;
  expected_start_date: string | null;
  portfolio_url: string | null;
  additional_info: string | null;
  status: InquiryStatus;
  admin_notes: string | null;
  created_at: string;
}

export async function listContactMessages(): Promise<ContactMessageRecord[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, admin_notes, created_at")
    .order("created_at", { ascending: false });
  if (error) throw toServiceError("Messages could not be loaded.", error);
  return (data ?? []) as ContactMessageRecord[];
}

export async function updateContactMessage(id: string, values: { status?: MessageStatus; admin_notes?: string | null }): Promise<void> {
  const { error } = await supabase.from("contact_messages").update(values).eq("id", id);
  if (error) throw toServiceError("The message could not be updated.", error);
}

export async function listHiringInquiries(): Promise<HiringInquiryRecord[]> {
  const { data, error } = await supabase
    .from("hiring_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw toServiceError("Hiring inquiries could not be loaded.", error);
  return (data ?? []) as HiringInquiryRecord[];
}

export async function updateHiringInquiry(id: string, values: { status?: InquiryStatus; admin_notes?: string | null }): Promise<void> {
  const { error } = await supabase.from("hiring_inquiries").update(values).eq("id", id);
  if (error) throw toServiceError("The inquiry could not be updated.", error);
}
