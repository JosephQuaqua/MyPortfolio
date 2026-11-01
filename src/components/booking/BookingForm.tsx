import { useState, type FormEvent } from "react";
import { exceedsLength, isValidEmail } from "../../lib/validation";
import { Field, HoneypotField, fieldDescribedBy } from "../forms/FormFields";

export interface BookingDetails {
  name: string;
  email: string;
  notes: string;
}

interface BookingFormProps {
  onSubmit: (details: BookingDetails) => Promise<void>;
}

type BookingErrors = Partial<Record<keyof BookingDetails, string>>;

const EMPTY_DETAILS: BookingDetails = { name: "", email: "", notes: "" };

function validate(values: BookingDetails): BookingErrors {
  const errors: BookingErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Enter your name.";
  else if (exceedsLength(name, 120)) errors.name = "Keep your name under 120 characters.";

  if (!isValidEmail(values.email.trim())) errors.email = "Enter a valid email address.";

  if (exceedsLength(values.notes.trim(), 2000)) errors.notes = "Keep your notes under 2000 characters.";
  return errors;
}

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [values, setValues] = useState<BookingDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (field: keyof BookingDetails, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    if (formData.get("website")) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        notes: values.notes.trim(),
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Your booking could not be completed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <div className="form__row">
        <Field id="booking-name" label="Name" required error={errors.name}>
          <input
            id="booking-name"
            name="name"
            className="input"
            autoComplete="name"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={fieldDescribedBy("booking-name", false, errors.name)}
          />
        </Field>
        <Field id="booking-email" label="Email" required error={errors.email}>
          <input
            id="booking-email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={fieldDescribedBy("booking-email", false, errors.email)}
          />
        </Field>
      </div>

      <Field id="booking-notes" label="What would you like to discuss?" error={errors.notes}>
        <textarea
          id="booking-notes"
          name="notes"
          className="textarea"
          rows={4}
          value={values.notes}
          onChange={(event) => setField("notes", event.target.value)}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={fieldDescribedBy("booking-notes", false, errors.notes)}
        />
      </Field>

      <HoneypotField />

      {submitError && (
        <p className="form__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "Booking..." : "Confirm booking"}
        </button>
      </div>
    </form>
  );
}
