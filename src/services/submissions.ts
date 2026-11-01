import { supabase } from "../lib/supabase";
import type { ContactMessageInput, HiringInquiryInput } from "../types/cms";
import { toServiceError } from "./errors";

export async function submitHiringInquiry(input: HiringInquiryInput): Promise<void> {
  const { error } = await supabase.from("hiring_inquiries").insert(input);
  if (error) throw toServiceError("Your inquiry could not be sent. Please try again.", error);
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert(input);
  if (error) throw toServiceError("Your message could not be sent. Please try again.", error);
}
