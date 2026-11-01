import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ id, label, required, error, hint, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> (required)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldDescribedBy(id: string, hasHint: boolean, error?: string): string | undefined {
  const parts = [hasHint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function HoneypotField() {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
