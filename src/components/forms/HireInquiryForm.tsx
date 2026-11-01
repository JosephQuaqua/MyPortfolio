import { useState, type FormEvent } from "react";
import { OPPORTUNITY_TYPES } from "../../lib/labels";
import { exceedsLength, isValidEmail, isValidHttpUrl } from "../../lib/validation";
import { submitHiringInquiry } from "../../services/submissions";
import type { OpportunityType } from "../../types/cms";
import { Field, HoneypotField, fieldDescribedBy } from "./FormFields";

interface HireValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  opportunityType: OpportunityType | "";
  positionTitle: string;
  projectDescription: string;
  budgetRange: string;
  expectedStartDate: string;
  portfolioUrl: string;
  additionalInfo: string;
}

type HireErrors = Partial<Record<keyof HireValues, string>>;
type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_VALUES: HireValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  opportunityType: "",
  positionTitle: "",
  projectDescription: "",
  budgetRange: "",
  expectedStartDate: "",
  portfolioUrl: "",
  additionalInfo: "",
};

function validate(values: HireValues): HireErrors {
  const errors: HireErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Enter your name.";
  else if (exceedsLength(name, 120)) errors.name = "Keep your name under 120 characters.";

  if (!isValidEmail(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.opportunityType) errors.opportunityType = "Choose an opportunity type.";

  if (exceedsLength(values.company.trim(), 160)) errors.company = "Keep this under 160 characters.";
  if (exceedsLength(values.positionTitle.trim(), 160)) errors.positionTitle = "Keep this under 160 characters.";
  if (exceedsLength(values.projectDescription.trim(), 5000)) errors.projectDescription = "Keep this under 5000 characters.";
  if (exceedsLength(values.budgetRange.trim(), 120)) errors.budgetRange = "Keep this under 120 characters.";
  if (exceedsLength(values.additionalInfo.trim(), 3000)) errors.additionalInfo = "Keep this under 3000 characters.";

  const portfolioUrl = values.portfolioUrl.trim();
  if (portfolioUrl && (exceedsLength(portfolioUrl, 500) || !isValidHttpUrl(portfolioUrl))) {
    errors.portfolioUrl = "Enter a full link starting with https://";
  }
  return errors;
}

const optionalText = (value: string): string | null => value.trim() || null;

export function HireInquiryForm() {
  const [values, setValues] = useState<HireValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<HireErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = <K extends keyof HireValues>(field: K, value: HireValues[K]) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const formData = new FormData(event.currentTarget);
    if (formData.get("website")) {
      setStatus("success");
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !values.opportunityType) return;

    setStatus("submitting");
    setSubmitError(null);
    try {
      await submitHiringInquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: optionalText(values.phone),
        company: optionalText(values.company),
        opportunity_type: values.opportunityType,
        position_title: optionalText(values.positionTitle),
        project_description: optionalText(values.projectDescription),
        budget_range: optionalText(values.budgetRange),
        expected_start_date: values.expectedStartDate || null,
        portfolio_url: optionalText(values.portfolioUrl),
        additional_info: optionalText(values.additionalInfo),
      });
      setValues(EMPTY_VALUES);
      setErrors({});
      setStatus("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Your inquiry could not be sent. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <h2 className="form-success__title">Inquiry received</h2>
        <p>Thank you. Your hiring inquiry has been received and will be reviewed.</p>
        <button type="button" className="btn btn--ghost" onClick={() => setStatus("idle")}>
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <div className="form__row">
        <Field id="hire-name" label="Name" required error={errors.name}>
          <input
            id="hire-name"
            name="name"
            className="input"
            autoComplete="name"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={fieldDescribedBy("hire-name", false, errors.name)}
          />
        </Field>
        <Field id="hire-email" label="Email" required error={errors.email}>
          <input
            id="hire-email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={fieldDescribedBy("hire-email", false, errors.email)}
          />
        </Field>
      </div>

      <div className="form__row">
        <Field id="hire-phone" label="Phone" hint="Optional. Include your country code.">
          <input
            id="hire-phone"
            name="phone"
            type="tel"
            className="input"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setField("phone", event.target.value)}
          />
        </Field>
      </div>

      <div className="form__row">
        <Field id="hire-company" label="Company / Organization" error={errors.company}>
          <input
            id="hire-company"
            name="company"
            className="input"
            autoComplete="organization"
            value={values.company}
            onChange={(event) => setField("company", event.target.value)}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={fieldDescribedBy("hire-company", false, errors.company)}
          />
        </Field>
        <Field id="hire-opportunity" label="Opportunity type" required error={errors.opportunityType}>
          <select
            id="hire-opportunity"
            name="opportunity_type"
            className="input"
            value={values.opportunityType}
            onChange={(event) => setField("opportunityType", event.target.value as HireValues["opportunityType"])}
            aria-invalid={Boolean(errors.opportunityType)}
            aria-describedby={fieldDescribedBy("hire-opportunity", false, errors.opportunityType)}
          >
            <option value="">Select an option</option>
            {OPPORTUNITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="hire-position" label="Position / Project title" error={errors.positionTitle}>
        <input
          id="hire-position"
          name="position_title"
          className="input"
          value={values.positionTitle}
          onChange={(event) => setField("positionTitle", event.target.value)}
          aria-invalid={Boolean(errors.positionTitle)}
          aria-describedby={fieldDescribedBy("hire-position", false, errors.positionTitle)}
        />
      </Field>

      <Field id="hire-description" label="Project description" error={errors.projectDescription}>
        <textarea
          id="hire-description"
          name="project_description"
          className="textarea"
          rows={5}
          value={values.projectDescription}
          onChange={(event) => setField("projectDescription", event.target.value)}
          aria-invalid={Boolean(errors.projectDescription)}
          aria-describedby={fieldDescribedBy("hire-description", false, errors.projectDescription)}
        />
      </Field>

      <div className="form__row">
        <Field id="hire-budget" label="Budget / Salary range" error={errors.budgetRange}>
          <input
            id="hire-budget"
            name="budget_range"
            className="input"
            value={values.budgetRange}
            onChange={(event) => setField("budgetRange", event.target.value)}
            aria-invalid={Boolean(errors.budgetRange)}
            aria-describedby={fieldDescribedBy("hire-budget", false, errors.budgetRange)}
          />
        </Field>
        <Field id="hire-start" label="Expected start date">
          <input
            id="hire-start"
            name="expected_start_date"
            type="date"
            className="input"
            value={values.expectedStartDate}
            onChange={(event) => setField("expectedStartDate", event.target.value)}
          />
        </Field>
      </div>

      <Field id="hire-portfolio" label="Portfolio / Company URL" hint="Include https:// at the start." error={errors.portfolioUrl}>
        <input
          id="hire-portfolio"
          name="portfolio_url"
          type="url"
          className="input"
          inputMode="url"
          value={values.portfolioUrl}
          onChange={(event) => setField("portfolioUrl", event.target.value)}
          aria-invalid={Boolean(errors.portfolioUrl)}
          aria-describedby={fieldDescribedBy("hire-portfolio", true, errors.portfolioUrl)}
        />
      </Field>

      <Field id="hire-additional" label="Additional information" error={errors.additionalInfo}>
        <textarea
          id="hire-additional"
          name="additional_info"
          className="textarea"
          rows={4}
          value={values.additionalInfo}
          onChange={(event) => setField("additionalInfo", event.target.value)}
          aria-invalid={Boolean(errors.additionalInfo)}
          aria-describedby={fieldDescribedBy("hire-additional", false, errors.additionalInfo)}
        />
      </Field>

      <HoneypotField />

      {submitError && (
        <p className="form__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
