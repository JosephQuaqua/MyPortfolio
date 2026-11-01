import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchStaffRole, signOutAdmin } from "../services/adminAuth";
import { supabase } from "../lib/supabase";
import type { AdminAuthState } from "../types/admin";

interface AdminAuthValue {
  state: AdminAuthState;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!session) {
          setState({ status: "signed-out" });
          return;
        }
        const email = session.user.email ?? null;
        try {
          const role = await fetchStaffRole(session.user.id);
          setState(role ? { status: "staff", role, email } : { status: "no-access", email });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Your admin access could not be checked.";
          setState({ status: "error", message });
        }
      })();
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const value: AdminAuthValue = {
    state,
    signOut: signOutAdmin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return value;
}

export function useIsAdmin(): boolean {
  const { state } = useAdminAuth();
  return state.status === "staff" && state.role === "admin";
}
