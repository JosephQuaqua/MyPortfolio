export type ProjectStatus = "in_progress" | "completed" | "deployed";
export type PublicationStatus = "draft" | "published" | "archived";

export type ExperienceType =
  | "Professional Experience"
  | "Freelance"
  | "Project Contribution"
  | "Backend Development"
  | "Full-Stack Development"
  | "Collaboration"
  | "Volunteer/Leadership";

export type OpportunityType =
  | "Full-Time"
  | "Part-Time"
  | "Contract"
  | "Freelance"
  | "Internship"
  | "Collaboration"
  | "Other";

export interface ProfileRow {
  id: number;
  full_name: string;
  professional_title: string | null;
  headline: string | null;
  summary: string | null;
  location: string | null;
  availability_status: string | null;
  is_available: boolean;
  profile_image_url: string | null;
  primary_cta_label: string | null;
  primary_cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export interface SiteSettingsRow {
  id: number;
  site_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
  canonical_url: string | null;
  footer_text: string | null;
  cv_url: string | null;
  cv_is_published: boolean;
}

export interface SocialLinkRow {
  id: string;
  platform: string;
  label: string;
  url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface ExperienceRow {
  id: string;
  title: string;
  organization: string | null;
  role: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  location: string | null;
  experience_type: ExperienceType;
  technologies: string[];
  achievements: string[];
  live_url: string | null;
  github_url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface ProjectTechnologyRow {
  id: string;
  name: string;
  display_order: number;
}

export interface ProjectImageRow {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string | null;
  display_order: number;
}

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  short_description: string | null;
  long_description: string | null;
  category: string | null;
  role: string | null;
  year: number | null;
  start_date: string | null;
  completion_date: string | null;
  project_status: ProjectStatus;
  is_featured: boolean;
  display_order: number;
  cover_image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  challenges: string | null;
  solution: string | null;
  technical_decisions: string | null;
  key_features: string[];
  technical_contributions: string[];
  outcome: string | null;
}

export interface ProjectWithDetails extends ProjectRow {
  project_technologies: ProjectTechnologyRow[];
  project_images: ProjectImageRow[];
}

export interface SkillCategoryRow {
  id: string;
  name: string;
  display_order: number;
}

export interface SkillRow {
  id: string;
  category_id: string;
  name: string;
  icon_url: string | null;
  proficiency_label: string | null;
  learning_period: string | null;
  display_order: number;
  is_featured: boolean;
}

export interface SkillGroup extends SkillCategoryRow {
  skills: SkillRow[];
}

export interface EducationRow {
  id: string;
  institution: string;
  location: string | null;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  relevant_areas: string[];
  achievements: string[];
  display_order: number;
  is_published: boolean;
}

export interface CertificationRow {
  id: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  credential_url_needs_verification: boolean;
  certificate_file_url: string | null;
  image_url: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  is_published: boolean;
}

export interface HiringInquiryInput {
  name: string;
  email: string;
  company: string | null;
  opportunity_type: OpportunityType;
  position_title: string | null;
  project_description: string | null;
  budget_range: string | null;
  expected_start_date: string | null;
  portfolio_url: string | null;
  additional_info: string | null;
  phone: string | null;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}
