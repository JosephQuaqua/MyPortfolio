import type { ProjectRow, ProjectStatus, ProjectTechnologyRow, PublicationStatus } from "./cms";

export type StaffRole = "admin" | "editor";

export type AdminAuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "no-access"; email: string | null }
  | { status: "error"; message: string }
  | { status: "staff"; role: StaffRole; email: string | null };

export type AdminProjectListItem = Pick<
  ProjectRow,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "project_status"
  | "is_featured"
  | "display_order"
  | "year"
  | "role"
  | "live_url"
  | "github_url"
> & {
  publication_status: PublicationStatus;
};

export interface AdminProjectDetail extends ProjectRow {
  publication_status: PublicationStatus;
  start_date: string | null;
  completion_date: string | null;
  project_technologies: ProjectTechnologyRow[];
}

export interface ProjectFormValues {
  title: string;
  slug: string;
  category: string;
  role: string;
  year: string;
  startDate: string;
  completionDate: string;
  projectStatus: ProjectStatus;
  publicationStatus: PublicationStatus;
  isFeatured: boolean;
  shortDescription: string;
  longDescription: string;
  challenges: string;
  solution: string;
  technicalDecisions: string;
  outcome: string;
  keyFeatures: string;
  technicalContributions: string;
  technologies: string;
  coverImageUrl: string;
  liveUrl: string;
  githubUrl: string;
}

export type ProjectFormErrors = Partial<Record<keyof ProjectFormValues, string>>;

export interface ProjectWritePayload {
  title: string;
  slug: string;
  category: string | null;
  role: string | null;
  year: number | null;
  start_date: string | null;
  completion_date: string | null;
  project_status: ProjectStatus;
  publication_status: PublicationStatus;
  is_featured: boolean;
  short_description: string | null;
  long_description: string | null;
  challenges: string | null;
  solution: string | null;
  technical_decisions: string | null;
  outcome: string | null;
  key_features: string[];
  technical_contributions: string[];
  cover_image_url: string | null;
  live_url: string | null;
  github_url: string | null;
}
