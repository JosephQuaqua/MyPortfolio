import { useState, type FormEvent } from "react";
import { exceedsLength, isValidEmail } from "../../lib/validation";
import { submitContactMessage } from "../../services/submissions";
import {
  Field,
  HoneypotField,
  fieldDescribedBy,
} from "./FormFields";

interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY_VALUES: ContactValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  const name = values.name.trim();

  if (!name) {
    errors.name = "Enter your name.";
  } else if (exceedsLength(name, 120)) {
    errors.name = "Keep your name under 120 characters.";
  }

  const email = values.email.trim();

  if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  const subject = values.subject.trim();

  if (!subject) {
    errors.subject = "Enter a subject.";
  } else if (exceedsLength(subject, 200)) {
    errors.subject = "Keep the subject under 200 characters.";
  }

  const message = values.message.trim();

  if (!message) {
    errors.message = "Enter a message.";
  } else if (exceedsLength(message, 5000)) {
    errors.message = "Keep the message under 5000 characters.";
  }

  return errors;
}

export function ContactForm() {
  const [values, setValues] =
    useState<ContactValues>(EMPTY_VALUES);

  const [errors, setErrors] =
    useState<ContactErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isSent, setIsSent] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const setField = (
    field: keyof ContactValues,
    value: string
  ) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    /*
     * Clear the field error as soon as the user starts
     * correcting it. This keeps the form feeling responsive
     * without hiding errors before validation occurs.
     */
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];

      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    /*
     * Honeypot protection.
     *
     * Real users never see or fill this field. Bots that
     * populate it are treated as successfully submitted so
     * we don't reveal that the request was rejected.
     */
    if (formData.get("website")) {
      setIsSent(true);
      return;
    }

    const nextErrors = validate(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });

      setValues(EMPTY_VALUES);
      setErrors({});
      setIsSent(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your message could not be sent. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div
        className="form-success"
        role="status"
        aria-live="polite"
      >
        <p className="form-success__eyebrow">
          Message sent
        </p>

        <h2 className="form-success__title">
          Thanks for reaching out.
        </h2>

        <p className="form-success__message">
          Your message has been received. I’ll get back to you
          as soon as I can.
        </p>

        <button
          type="button"
          className="form-success__reset"
          onClick={() => {
            setIsSent(false);
            setSubmitError(null);
          }}
        >
          <span>Send another message</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="form"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="form__row">
        <Field
          id="contact-name"
          label="Name"
          required
          error={errors.name}
        >
          <input
            id="contact-name"
            name="name"
            type="text"
            className="input"
            autoComplete="name"
            value={values.name}
            onChange={(event) =>
              setField("name", event.target.value)
            }
            aria-invalid={Boolean(errors.name)}
            aria-describedby={fieldDescribedBy(
              "contact-name",
              false,
              errors.name
            )}
          />
        </Field>

        <Field
          id="contact-email"
          label="Email"
          required
          error={errors.email}
        >
          <input
            id="contact-email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            value={values.email}
            onChange={(event) =>
              setField("email", event.target.value)
            }
            aria-invalid={Boolean(errors.email)}
            aria-describedby={fieldDescribedBy(
              "contact-email",
              false,
              errors.email
            )}
          />
        </Field>
      </div>

      <Field
        id="contact-subject"
        label="Subject"
        required
        error={errors.subject}
      >
        <input
          id="contact-subject"
          name="subject"
          type="text"
          className="input"
          value={values.subject}
          onChange={(event) =>
            setField("subject", event.target.value)
          }
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={fieldDescribedBy(
            "contact-subject",
            false,
            errors.subject
          )}
        />
      </Field>

      <Field
        id="contact-message"
        label="Message"
        required
        error={errors.message}
      >
        <textarea
          id="contact-message"
          name="message"
          className="textarea"
          rows={8}
          value={values.message}
          onChange={(event) =>
            setField("message", event.target.value)
          }
          aria-invalid={Boolean(errors.message)}
          aria-describedby={fieldDescribedBy(
            "contact-message",
            false,
            errors.message
          )}
        />
      </Field>

      <HoneypotField />

      {submitError && (
        <p
          className="form__error"
          role="alert"
          aria-live="assertive"
        >
          {submitError}
        </p>
      )}

      <div className="form__actions">
        <button
          type="submit"
          className="form__submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <span>
            {isSubmitting
              ? "Sending..."
              : "Send message"}
          </span>

          {!isSubmitting && (
            <span aria-hidden="true">→</span>
          )}
        </button>
      </div>
    </form>
  );
}