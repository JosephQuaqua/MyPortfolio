import type { ChangeEvent, FormEvent } from "react";
import { Field, fieldDescribedBy } from "../forms/FormFields";
import type { FieldConfig, FormErrors, FormValues, SelectOption } from "../../lib/recordForm";

interface RecordFormProps {
  fields: FieldConfig[];
  values: FormValues;
  errors: FormErrors;
  optionsByKey: Record<string, SelectOption[]>;
  submitLabel: string;
  isSaving: boolean;
  submitError: string | null;
  onChange: (key: string, value: string | boolean) => void;
  onSubmit: () => void;
}

export function RecordForm({ fields, values, errors, optionsByKey, submitLabel, isSaving, submitError, onChange, onSubmit }: RecordFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSaving) onSubmit();
  }

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      {fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={values[field.key]}
          error={errors[field.key]}
          options={optionsByKey[field.key] ?? field.options ?? []}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
      {submitError && (
        <p className="form__error" role="alert">
          {submitError}
        </p>
      )}
      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FieldInputProps {
  field: FieldConfig;
  value: string | boolean | undefined;
  error: string | undefined;
  options: SelectOption[];
  onChange: (value: string | boolean) => void;
}

function FieldInput({ field, value, error, options, onChange }: FieldInputProps) {
  const id = `field-${field.key}`;
  const text = typeof value === "string" ? value : "";
  const describedBy = fieldDescribedBy(id, Boolean(field.hint), error);
  const inputProps = {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
  };

  if (field.kind === "checkbox") {
    return (
      <label className="checkbox">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  const handleText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value);

  let control;
  if (field.kind === "textarea" || field.kind === "list") {
    control = (
      <textarea
        {...inputProps}
        className="textarea"
        rows={4}
        value={text}
        onChange={handleText}
      />
    );
  } else if (field.kind === "select") {
    control = (
      <select {...inputProps} className="input" value={text} onChange={handleText}>
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    const inputType = inputTypeFor(field.kind);
    control = (
      <input
        {...inputProps}
        className="input"
        type={inputType}
        inputMode={field.kind === "number" ? "decimal" : undefined}
        value={text}
        onChange={handleText}
      />
    );
  }

  return (
    <Field id={id} label={field.label} required={field.required} error={error} hint={field.hint}>
      {control}
    </Field>
  );
}

function inputTypeFor(kind: FieldConfig["kind"]): string {
  switch (kind) {
    case "email":
      return "email";
    case "url":
      return "text";
    case "date":
      return "date";
    case "time":
      return "time";
    case "datetime":
      return "datetime-local";
    case "number":
      return "number";
    default:
      return "text";
  }
}
