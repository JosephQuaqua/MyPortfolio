import { useState } from "react";
import { RecordForm } from "./RecordForm";
import { hasErrors, toFormValues, toPayload, validateRecord, type FieldConfig, type FormErrors, type FormValues, type SelectOption, type TableRecord } from "../../lib/recordForm";
import { insertRow, updateRow } from "../../services/cmsTable";

export interface RecordEditorProps {
  table: string;
  title: string;
  fields: FieldConfig[];
  record: TableRecord | null;
  recordId: string | null;
  nextDisplayOrder: number | null;
  optionsByKey: Record<string, SelectOption[]>;
  validate?: (values: FormValues) => FormErrors;
  onSaved: () => void;
}

export function RecordEditor({ table, title, fields, record, recordId, nextDisplayOrder, optionsByKey, validate, onSaved }: RecordEditorProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(fields, record));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(key: string, value: string | boolean) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit() {
    const nextErrors = { ...validateRecord(fields, values), ...(validate?.(values) ?? {}) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const payload = toPayload(fields, values);
    setIsSaving(true);
    setSubmitError(null);
    try {
      if (recordId) {
        await updateRow(table, recordId, payload, `${title} could not be saved. Please try again.`);
      } else {
        const withOrder = nextDisplayOrder === null ? payload : { ...payload, display_order: nextDisplayOrder };
        await insertRow(table, withOrder, `${title} could not be saved. Please try again.`);
      }
      onSaved();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : `${title} could not be saved. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <RecordForm
      fields={fields}
      values={values}
      errors={errors}
      optionsByKey={optionsByKey}
      submitLabel={recordId ? "Save changes" : "Add"}
      isSaving={isSaving}
      submitError={submitError}
      onChange={handleChange}
      onSubmit={() => void handleSubmit()}
    />
  );
}
