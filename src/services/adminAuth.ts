import { supabase } from "../lib/supabase";
import type { StaffRole } from "../types/admin";

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("Admin sign-in failed", error);
    throw new Error("The email or password is incorrect.");
  }
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Admin sign-out failed", error);
    throw new Error("You could not be signed out. Please try again.");
  }
}

export async function fetchStaffRole(userId: string): Promise<StaffRole | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Admin access check failed", error);
    throw new Error("Your admin access could not be checked. Please try again.");
  }
  if (data?.role === "admin" || data?.role === "editor") return data.role;
  return null;
}
