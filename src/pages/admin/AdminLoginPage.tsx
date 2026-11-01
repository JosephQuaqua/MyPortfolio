import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { signInWithPassword } from "../../services/adminAuth";
import { isValidEmail } from "../../lib/validation";
import { Field, fieldDescribedBy } from "../../components/forms/FormFields";
import { AdminAccessProblem, AdminStatusPanel } from "../../components/admin/RequireStaff";

export function AdminLoginPage() {
  const { state } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (state.status === "loading") {
    return <AdminStatusPanel title="Checking your access..." />;
  }
  if (state.status === "staff") {
    return <Navigate to="/admin/projects" replace />;
  }
  if (state.status === "no-access" || state.status === "error") {
    return <AdminAccessProblem />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(undefined);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await signInWithPassword(trimmedEmail, password);
      setPassword("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <p className="mono-label">Admin</p>
        <h1 className="admin-login__title">Sign in to manage your site</h1>
        <form className="form" noValidate onSubmit={handleSubmit}>
          <Field id="admin-email" label="Email" required error={emailError}>
            <input
              id="admin-email"
              name="email"
              type="email"
              className="input"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={fieldDescribedBy("admin-email", false, emailError)}
            />
          </Field>
          <Field id="admin-password" label="Password" required>
            <input
              id="admin-password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {submitError && (
            <p className="form__error" role="alert">
              {submitError}
            </p>
          )}
          <div className="form__actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting || !password}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
