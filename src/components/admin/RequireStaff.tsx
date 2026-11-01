import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export function RequireStaff() {
  const { state } = useAdminAuth();

  if (state.status === "loading") {
    return <AdminStatusPanel title="Checking your access..." />;
  }
  if (state.status === "signed-out") {
    return <Navigate to="/admin/login" replace />;
  }
  if (state.status === "staff") {
    return <Outlet />;
  }
  return <AdminAccessProblem />;
}

export function AdminStatusPanel({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="admin-status" role="status" aria-live="polite">
      <span className="state__pulse" aria-hidden="true" />
      <p className="admin-status__title">{title}</p>
      {children}
    </div>
  );
}

export function AdminAccessProblem() {
  const { state, signOut } = useAdminAuth();
  const message =
    state.status === "error"
      ? state.message
      : "This account does not have admin access. Sign in with an administrator account.";

  return (
    <AdminStatusPanel title="Admin access unavailable">
      <p className="admin-status__text" role="alert">
        {message}
      </p>
      <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
        Sign out
      </button>
    </AdminStatusPanel>
  );
}
