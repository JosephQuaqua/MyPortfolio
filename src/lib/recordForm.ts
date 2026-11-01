import { toSafeHref } from "./links";
import { parseCommaList, parseLines } from "./projectForm";

export type FieldKind =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "date"
  | "time"
  | "datetime"
  | "number"
  | "select"
  | "checkbox"
  | "list"
  | "csv";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  hint?: string;
  maxLength?: number;
  options?: SelectOption[];
  numeric?: boolean;
}

export type FormValues = Record<string, string | boolean>;
export type FormErrors = Partial<Record<string, string>>;
export type TableRecord = Record<string, unknown>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toFormValues(fields: FieldConfig[], row: TableRecord | null): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const raw = row?.[field.key];
    if (field.kind === "checkbox") {
      values[field.key] = raw === true;
    } else if (field.kind === "list" || field.kind === "csv") {
      values[field.key] = Array.isArray(raw) ? raw.join(field.kind === "list" ? "\n" : ", ") : "";
    } else if (field.kind === "datetime") {
      values[field.key] = typeof raw === "string" ? toLocalDateTimeInput(raw) : "";
    } else {
      values[field.key] = raw === null || raw === undefined ? "" : String(raw);
    }
  }
  return values;
}

export function toPayload(fields: FieldConfig[], values: FormValues): TableRecord {
  const payload: TableRecord = {};
  for (const field of fields) {
    const value = values[field.key];
    if (field.kind === "checkbox") {
      payload[field.key] = value === true;
    } else if (field.kind === "list") {
      payload[field.key] = parseLines(String(value ?? ""));
    } else if (field.kind === "csv") {
      payload[field.key] = parseCommaList(String(value ?? ""));
    } else if (field.kind === "number") {
      const text = String(value ?? "").trim();
      payload[field.key] = text === "" ? null : Number(text);
    } else if (field.kind === "datetime") {
      const text = String(value ?? "").trim();
      payload[field.key] = text === "" ? null : new Date(text).toISOString();
    } else if (field.numeric) {
      const text = String(value ?? "").trim();
      payload[field.key] = text === "" ? null : Number(text);
    } else {
      const text = String(value ?? "").trim();
      payload[field.key] = text === "" ? null : text;
    }
  }
  return payload;
}

export function validateRecord(fields: FieldConfig[], values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const field of fields) {
    const text = String(values[field.key] ?? "").trim();
    if (field.kind === "checkbox") continue;
    if (field.required && text === "") {
      errors[field.key] = `${field.label} is required.`;
      continue;
    }
    if (text === "") continue;
    if (field.maxLength && text.length > field.maxLength) {
      errors[field.key] = `${field.label} must be ${field.maxLength} characters or fewer.`;
    } else if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      errors[field.key] = "Enter a valid email address.";
    } else if (field.kind === "url" && toSafeHref(text) === null) {
      errors[field.key] = "Use a full web address starting with https://, or an email or phone link.";
    } else if (field.kind === "date" && !DATE_PATTERN.test(text)) {
      errors[field.key] = "Enter a valid date.";
    } else if (field.kind === "number" && !Number.isFinite(Number(text))) {
      errors[field.key] = "Enter a number.";
    }
  }
  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

function toLocalDateTimeInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
