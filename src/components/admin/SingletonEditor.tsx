import { useState } from "react";
import { RecordForm } from "./RecordForm";
import { hasErrors, toFormValues, toPayload, validateRecord, type FieldConfig, type FormErrors, type FormValues, type TableRecord } from "../../lib/recordForm";

export interface SingletonEditorProps {
  title: string;
  fields: FieldConfig[];
  record: TableRecord;
  onSave: (payload: TableRecord) => Promise<void>;
}

export function SingletonEditor({ title, fields, record, onSave }: SingletonEditorProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(fields, record));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleChange(key: string, value: string | boolean) {
    setSaved(false);
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit() {
    const nextErrors = validateRecord(fields, values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      await onSave(toPayload(fields, values));
      setSaved(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : `${title} could not be saved. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {saved && (
        <p className="form__success" role="status">
          Saved. Changes are live on the site.
        </p>
      )}
      <RecordForm
        fields={fields}
        values={values}
        errors={errors}
        optionsByKey={{}}
        submitLabel="Save changes"
        isSaving={isSaving}
        submitError={submitError}
        onChange={handleChange}
        onSubmit={() => void handleSubmit()}
      />
    </>
  );
}
