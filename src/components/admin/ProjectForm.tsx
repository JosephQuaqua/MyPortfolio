import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Field, fieldDescribedBy } from "../forms/FormFields";
import { PROJECT_STATUS_LABELS } from "../../lib/labels";
import { slugify, toProjectPayload, validateProjectForm, parseCommaList } from "../../lib/projectForm";
import { DuplicateSlugError, createProject, updateProject } from "../../services/adminProjects";
import type { ProjectFormErrors, ProjectFormValues } from "../../types/admin";
import type { ProjectStatus, PublicationStatus } from "../../types/cms";

interface ProjectFormProps {
  projectId: string | null;
  initialValues: ProjectFormValues;
}

const PUBLICATION_OPTIONS: { value: PublicationStatus; label: string }[] = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Published (visible)" },
  { value: "archived", label: "Archived (hidden)" },
];

export function ProjectForm({ projectId, initialValues }: ProjectFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [slugEdited, setSlugEdited] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const setField = <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setSavedMessage(null);
  };

  const handleTitleChange = (title: string) => {
    setValues((previous) => ({
      ...previous,
      title,
      slug: slugEdited ? previous.slug : slugify(title),
    }));
    setSavedMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const nextErrors = validateProjectForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setSubmitError(null);
    setSavedMessage(null);
    const payload = toProjectPayload(values);
    const technologies = parseCommaList(values.technologies);
    try {
      if (projectId) {
        await updateProject(projectId, payload, technologies);
        setSavedMessage("Changes saved.");
      } else {
        const newId = await createProject(payload, technologies);
        navigate(`/admin/projects/${newId}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof DuplicateSlugError) {
        setErrors((previous) => ({ ...previous, slug: err.message }));
      } else {
        setSubmitError(err instanceof Error ? err.message : "The project could not be saved. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="form admin-project-form" noValidate onSubmit={handleSubmit}>
      <fieldset className="admin-form-section">
        <legend className="admin-form-section__title">Overview</legend>
        <Field id="project-title" label="Title" required error={errors.title}>
          <input
            id="project-title"
            className="input"
            value={values.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={fieldDescribedBy("project-title", false, errors.title)}
          />
        </Field>
        <div className="form__row">
          <Field
            id="project-slug"
            label="URL slug"
            required
            error={errors.slug}
            hint="Used in the project web address, for example /projects/my-project."
          >
            <input
              id="project-slug"
              className="input"
              value={values.slug}
              onChange={(event) => {
                setSlugEdited(true);
                setField("slug", event.target.value);
              }}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={fieldDescribedBy("project-slug", true, errors.slug)}
            />
          </Field>
          <Field id="project-category" label="Category">
            <input
              id="project-category"
              className="input"
              value={values.category}
              onChange={(event) => setField("category", event.target.value)}
            />
          </Field>
        </div>
        <Field id="project-short" label="Short description" error={errors.shortDescription}>
          <textarea
            id="project-short"
            className="textarea"
            rows={2}
            value={values.shortDescription}
            onChange={(event) => setField("shortDescription", event.target.value)}
            aria-invalid={Boolean(errors.shortDescription)}
            aria-describedby={fieldDescribedBy("project-short", false, errors.shortDescription)}
          />
        </Field>
        <Field id="project-long" label="Full description" hint="Paragraphs are supported. Separate paragraphs with a blank line.">
          <textarea
            id="project-long"
            className="textarea"
            rows={6}
            value={values.longDescription}
            onChange={(event) => setField("longDescription", event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend className="admin-form-section__title">Role and dates</legend>
        <div className="form__row">
          <Field id="project-role" label="Your role">
            <input
              id="project-role"
              className="input"
              value={values.role}
              onChange={(event) => setField("role", event.target.value)}
            />
          </Field>
          <Field id="project-year" label="Year" error={errors.year}>
            <input
              id="project-year"
              className="input"
              inputMode="numeric"
              value={values.year}
              onChange={(event) => setField("year", event.target.value)}
              aria-invalid={Boolean(errors.year)}
              aria-describedby={fieldDescribedBy("project-year", false, errors.year)}
            />
          </Field>
        </div>
        <div className="form__row">
          <Field id="project-start" label="Start date">
            <input
              id="project-start"
              type="date"
              className="input"
              value={values.startDate}
              onChange={(event) => setField("startDate", event.target.value)}
            />
          </Field>
          <Field id="project-completion" label="Completion date" error={errors.completionDate}>
            <input
              id="project-completion"
              type="date"
              className="input"
              value={values.completionDate}
              onChange={(event) => setField("completionDate", event.target.value)}
              aria-invalid={Boolean(errors.completionDate)}
              aria-describedby={fieldDescribedBy("project-completion", false, errors.completionDate)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend className="admin-form-section__title">Case study</legend>
        <Field id="project-challenges" label="Challenges">
          <textarea
            id="project-challenges"
            className="textarea"
            rows={3}
            value={values.challenges}
            onChange={(event) => setField("challenges", event.target.value)}
          />
        </Field>
        <Field id="project-solution" label="Solution">
          <textarea
            id="project-solution"
            className="textarea"
            rows={3}
            value={values.solution}
            onChange={(event) => setField("solution", event.target.value)}
          />
        </Field>
        <Field id="project-decisions" label="Technical decisions">
          <textarea
            id="project-decisions"
            className="textarea"
            rows={3}
            value={values.technicalDecisions}
            onChange={(event) => setField("technicalDecisions", event.target.value)}
          />
        </Field>
        <Field id="project-outcome" label="Outcome">
          <textarea
            id="project-outcome"
            className="textarea"
            rows={2}
            value={values.outcome}
            onChange={(event) => setField("outcome", event.target.value)}
          />
        </Field>
        <Field id="project-features" label="Key features" hint="One feature per line.">
          <textarea
            id="project-features"
            className="textarea"
            rows={4}
            value={values.keyFeatures}
            onChange={(event) => setField("keyFeatures", event.target.value)}
          />
        </Field>
        <Field id="project-contributions" label="Technical contributions" hint="One item per line.">
          <textarea
            id="project-contributions"
            className="textarea"
            rows={4}
            value={values.technicalContributions}
            onChange={(event) => setField("technicalContributions", event.target.value)}
          />
        </Field>
        <Field id="project-technologies" label="Technologies" hint="Separate with commas, for example React, TypeScript, Supabase.">
          <input
            id="project-technologies"
            className="input"
            value={values.technologies}
            onChange={(event) => setField("technologies", event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend className="admin-form-section__title">Links and visibility</legend>
        <Field id="project-live" label="Live URL" hint="Leave empty to hide the live site button." error={errors.liveUrl}>
          <input
            id="project-live"
            type="url"
            inputMode="url"
            className="input"
            value={values.liveUrl}
            onChange={(event) => setField("liveUrl", event.target.value)}
            aria-invalid={Boolean(errors.liveUrl)}
            aria-describedby={fieldDescribedBy("project-live", true, errors.liveUrl)}
          />
        </Field>
        <Field id="project-github" label="GitHub URL" hint="Leave empty to hide the GitHub button." error={errors.githubUrl}>
          <input
            id="project-github"
            type="url"
            inputMode="url"
            className="input"
            value={values.githubUrl}
            onChange={(event) => setField("githubUrl", event.target.value)}
            aria-invalid={Boolean(errors.githubUrl)}
            aria-describedby={fieldDescribedBy("project-github", true, errors.githubUrl)}
          />
        </Field>
        <Field id="project-cover" label="Cover image URL" error={errors.coverImageUrl}>
          <input
            id="project-cover"
            type="url"
            inputMode="url"
            className="input"
            value={values.coverImageUrl}
            onChange={(event) => setField("coverImageUrl", event.target.value)}
            aria-invalid={Boolean(errors.coverImageUrl)}
            aria-describedby={fieldDescribedBy("project-cover", false, errors.coverImageUrl)}
          />
        </Field>
        <div className="form__row">
          <Field id="project-status" label="Project status">
            <select
              id="project-status"
              className="input"
              value={values.projectStatus}
              onChange={(event) => setField("projectStatus", event.target.value as ProjectStatus)}
            >
              {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((status) => (
                <option key={status} value={status}>
                  {PROJECT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="project-publication" label="Visibility">
            <select
              id="project-publication"
              className="input"
              value={values.publicationStatus}
              onChange={(event) => setField("publicationStatus", event.target.value as PublicationStatus)}
            >
              {PUBLICATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(event) => setField("isFeatured", event.target.checked)}
          />
          <span>Feature this project</span>
        </label>
      </fieldset>

      {submitError && (
        <p className="form__error" role="alert">
          {submitError}
        </p>
      )}
      {savedMessage && (
        <p className="form__success" role="status">
          {savedMessage}
        </p>
      )}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? "Saving..." : projectId ? "Save changes" : "Create project"}
        </button>
      </div>
    </form>
  );
}
