import type { ProjectFormErrors, ProjectFormValues, ProjectWritePayload, AdminProjectDetail } from "../types/admin";
import { exceedsLength, isValidHttpUrl } from "./validation";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function emptyProjectForm(): ProjectFormValues {
  return {
    title: "",
    slug: "",
    category: "",
    role: "",
    year: "",
    startDate: "",
    completionDate: "",
    projectStatus: "in_progress",
    publicationStatus: "draft",
    isFeatured: false,
    shortDescription: "",
    longDescription: "",
    challenges: "",
    solution: "",
    technicalDecisions: "",
    outcome: "",
    keyFeatures: "",
    technicalContributions: "",
    technologies: "",
    coverImageUrl: "",
    liveUrl: "",
    githubUrl: "",
  };
}

export function toProjectFormValues(project: AdminProjectDetail): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category ?? "",
    role: project.role ?? "",
    year: project.year ? String(project.year) : "",
    startDate: project.start_date ?? "",
    completionDate: project.completion_date ?? "",
    projectStatus: project.project_status,
    publicationStatus: project.publication_status,
    isFeatured: project.is_featured,
    shortDescription: project.short_description ?? "",
    longDescription: project.long_description ?? "",
    challenges: project.challenges ?? "",
    solution: project.solution ?? "",
    technicalDecisions: project.technical_decisions ?? "",
    outcome: project.outcome ?? "",
    keyFeatures: project.key_features.join("\n"),
    technicalContributions: project.technical_contributions.join("\n"),
    technologies: project.project_technologies
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map((technology) => technology.name)
      .join(", "),
    coverImageUrl: project.cover_image_url ?? "",
    liveUrl: project.live_url ?? "",
    githubUrl: project.github_url ?? "",
  };
}

export function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseCommaList(text: string): string[] {
  const seen = new Set<string>();
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item.toLowerCase())) return false;
      seen.add(item.toLowerCase());
      return true;
    });
}

export function validateProjectForm(values: ProjectFormValues): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  const title = values.title.trim();
  const slug = values.slug.trim();

  if (!title) errors.title = "Enter a project title.";
  else if (exceedsLength(title, 160)) errors.title = "Keep the title under 160 characters.";

  if (!slug) errors.slug = "Enter a slug, for example my-project.";
  else if (exceedsLength(slug, 120) || !SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens only.";
  }

  const year = values.year.trim();
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 1990 || Number(year) > 2100)) {
    errors.year = "Enter a four-digit year between 1990 and 2100.";
  }

  if (values.startDate && values.completionDate && values.completionDate < values.startDate) {
    errors.completionDate = "The completion date cannot be before the start date.";
  }

  if (exceedsLength(values.shortDescription.trim(), 300)) {
    errors.shortDescription = "Keep the short description under 300 characters.";
  }

  for (const field of ["coverImageUrl", "liveUrl", "githubUrl"] as const) {
    const value = values[field].trim();
    if (value && (exceedsLength(value, 500) || !isValidHttpUrl(value))) {
      errors[field] = "Enter a full link starting with https://";
    }
  }
  return errors;
}

const optionalText = (value: string): string | null => value.trim() || null;

export function toProjectPayload(values: ProjectFormValues): ProjectWritePayload {
  const year = values.year.trim();
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    category: optionalText(values.category),
    role: optionalText(values.role),
    year: year ? Number(year) : null,
    start_date: values.startDate || null,
    completion_date: values.completionDate || null,
    project_status: values.projectStatus,
    publication_status: values.publicationStatus,
    is_featured: values.isFeatured,
    short_description: optionalText(values.shortDescription),
    long_description: optionalText(values.longDescription),
    challenges: optionalText(values.challenges),
    solution: optionalText(values.solution),
    technical_decisions: optionalText(values.technicalDecisions),
    outcome: optionalText(values.outcome),
    key_features: parseLines(values.keyFeatures),
    technical_contributions: parseLines(values.technicalContributions),
    cover_image_url: optionalText(values.coverImageUrl),
    live_url: optionalText(values.liveUrl),
    github_url: optionalText(values.githubUrl),
  };
}
