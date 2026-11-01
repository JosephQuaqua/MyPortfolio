import type { EntityConfig } from "../../components/admin/EntityManager";
import type { FormValues, SelectOption } from "../../lib/recordForm";
import { listRows } from "../../services/cmsTable";

interface ExperienceRecord {
  id: string;
  title: string;
  organization: string | null;
  experience_type: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  is_published: boolean;
}

interface SkillRecord {
  id: string;
  name: string;
  category_id: string;
  is_featured: boolean;
  is_published: boolean;
  skill_categories: { name: string } | null;
}

interface EducationRecord {
  id: string;
  institution: string;
  degree: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  is_published: boolean;
}

interface CertificationRecord {
  id: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  is_featured: boolean;
  is_published: boolean;
}

interface SocialLinkRecord {
  id: string;
  platform: string;
  label: string;
  url: string | null;
  is_published: boolean;
}

interface ConsultationTypeRecord {
  id: string;
  name: string;
  duration_minutes: number;
  price_amount: number | null;
  currency: string;
  is_active: boolean;
}

interface AvailabilityRuleRecord {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

interface AvailabilityBlockRecord {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

export const DAY_OPTIONS: SelectOption[] = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const EXPERIENCE_TYPE_OPTIONS: SelectOption[] = [
  "Professional Experience",
  "Freelance",
  "Project Contribution",
  "Backend Development",
  "Full-Stack Development",
  "Collaboration",
  "Volunteer/Leadership",
].map((value) => ({ value, label: value }));

export function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function dateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  return `${formatDate(start)} - ${isCurrent ? "Present" : formatDate(end)}`;
}

function compareDates(start: string | undefined, end: string | undefined): boolean {
  return Boolean(start && end && end < start);
}

function loadSkillCategoryOptions(): Promise<Record<string, SelectOption[]>> {
  return listRows<{ id: string; name: string }>("skill_categories", "id, name", "Skill categories could not be loaded.", {
    column: "display_order",
  }).then((rows) => ({ category_id: rows.map((row) => ({ value: row.id, label: row.name })) }));
}

export const experienceConfig: EntityConfig<ExperienceRecord> = {
  table: "experiences",
  title: "Experience",
  description: "Roles and work history shown in the Experience section, in the order listed here.",
  addLabel: "Add experience",
  itemNoun: "experience",
  select: "*",
  orderColumn: "display_order",
  publishColumn: "is_published",
  columns: [
    { header: "Title", render: (row) => row.title },
    { header: "Organization", render: (row) => row.organization ?? "-" },
    { header: "Type", render: (row) => row.experience_type },
    { header: "Dates", render: (row) => dateRange(row.start_date, row.end_date, row.is_current) },
  ],
  fields: [
    { key: "title", label: "Title", kind: "text", required: true, maxLength: 160 },
    { key: "organization", label: "Organization", kind: "text", maxLength: 160 },
    { key: "role", label: "Role", kind: "text", maxLength: 160 },
    { key: "experience_type", label: "Experience type", kind: "select", required: true, options: EXPERIENCE_TYPE_OPTIONS },
    { key: "start_date", label: "Start date", kind: "date" },
    { key: "end_date", label: "End date", kind: "date", hint: "Leave empty for a current role." },
    { key: "is_current", label: "I currently work here", kind: "checkbox" },
    { key: "location", label: "Location", kind: "text", maxLength: 160 },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "technologies", label: "Technologies", kind: "csv", hint: "Separate with commas." },
    { key: "achievements", label: "Achievements", kind: "list", hint: "One achievement per line." },
    { key: "live_url", label: "Live URL", kind: "url", hint: "Leave empty to hide the button." },
    { key: "github_url", label: "GitHub URL", kind: "url", hint: "Leave empty to hide the button." },
    { key: "is_published", label: "Published", kind: "checkbox" },
  ],
  nameOf: (row) => row.title,
  validate: (values: FormValues) => {
    if (compareDates(values.start_date as string, values.end_date as string)) {
      return { end_date: "End date must be after the start date." };
    }
    return {};
  },
  emptyMessage: "No experience has been added yet. Add your first role to show it on the site.",
};

export const skillCategoryConfig: EntityConfig<{ id: string; name: string; display_order: number; is_published: boolean }> = {
  table: "skill_categories",
  title: "Skill categories",
  description: "Groups used to organize skills on the site. A category with skills cannot be deleted until those skills are moved or removed.",
  addLabel: "Add category",
  itemNoun: "skill category",
  select: "*",
  orderColumn: "display_order",
  publishColumn: "is_published",
  columns: [{ header: "Name", render: (row) => row.name }],
  fields: [
    { key: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
    { key: "is_published", label: "Published", kind: "checkbox" },
  ],
  nameOf: (row) => row.name,
  emptyMessage: "No skill categories yet. Add a category before adding skills.",
};

export const skillConfig: EntityConfig<SkillRecord> = {
  table: "skills",
  title: "Skills",
  description: "Individual skills, grouped by category. Featured skills are highlighted on the site.",
  addLabel: "Add skill",
  itemNoun: "skill",
  select: "*, skill_categories(name)",
  orderColumn: "display_order",
  publishColumn: "is_published",
  toggles: [{ column: "is_featured", label: "Featured" }],
  columns: [
    { header: "Skill", render: (row) => row.name },
    { header: "Category", render: (row) => row.skill_categories?.name ?? "-" },
  ],
  fields: [
    { key: "name", label: "Skill", kind: "text", required: true, maxLength: 80 },
    { key: "category_id", label: "Category", kind: "select", required: true },
    { key: "proficiency_label", label: "Proficiency label", kind: "text", maxLength: 80, hint: "Optional text, for example Working knowledge." },
    { key: "learning_period", label: "Learning period", kind: "text", maxLength: 80 },
    { key: "is_featured", label: "Featured", kind: "checkbox" },
    { key: "is_published", label: "Published", kind: "checkbox" },
  ],
  nameOf: (row) => row.name,
  loadOptions: loadSkillCategoryOptions,
  emptyMessage: "No skills have been added yet.",
};

export const educationConfig: EntityConfig<EducationRecord> = {
  table: "education",
  title: "Education",
  description: "Schools and programs shown in the Education section.",
  addLabel: "Add education",
  itemNoun: "education entry",
  select: "*",
  orderColumn: "display_order",
  publishColumn: "is_published",
  columns: [
    { header: "Institution", render: (row) => row.institution },
    { header: "Degree", render: (row) => row.degree ?? "-" },
    { header: "Dates", render: (row) => dateRange(row.start_date, row.end_date, row.is_current) },
  ],
  fields: [
    { key: "institution", label: "Institution", kind: "text", required: true, maxLength: 160 },
    { key: "location", label: "Location", kind: "text", maxLength: 160 },
    { key: "degree", label: "Degree", kind: "text", maxLength: 160 },
    { key: "field", label: "Field of study", kind: "text", maxLength: 160 },
    { key: "start_date", label: "Start date", kind: "date" },
    { key: "end_date", label: "End date", kind: "date" },
    { key: "is_current", label: "I am currently studying here", kind: "checkbox" },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "relevant_areas", label: "Relevant areas", kind: "csv", hint: "Separate with commas." },
    { key: "achievements", label: "Achievements", kind: "list", hint: "One per line." },
    { key: "is_published", label: "Published", kind: "checkbox" },
  ],
  nameOf: (row) => row.institution,
  validate: (values: FormValues) => {
    if (compareDates(values.start_date as string, values.end_date as string)) {
      return { end_date: "End date must be after the start date." };
    }
    return {};
  },
  emptyMessage: "No education entries yet.",
};

export const certificationConfig: EntityConfig<CertificationRecord> = {
  table: "certifications",
  title: "Certifications",
  description: "Certificates shown on the Certificates page. Leave a credential URL empty if you do not have one; nothing is shown in its place.",
  addLabel: "Add certificate",
  itemNoun: "certificate",
  select: "*",
  orderColumn: "display_order",
  publishColumn: "is_published",
  toggles: [{ column: "is_featured", label: "Featured" }],
  columns: [
    { header: "Certificate", render: (row) => row.name },
    { header: "Issuer", render: (row) => row.issuer },
    { header: "Date", render: (row) => formatDate(row.issue_date) },
  ],
  fields: [
    { key: "name", label: "Name", kind: "text", required: true, maxLength: 200 },
    { key: "issuer", label: "Issuer", kind: "text", required: true, maxLength: 160 },
    { key: "issue_date", label: "Issue date", kind: "date" },
    { key: "credential_id", label: "Credential ID", kind: "text", maxLength: 120 },
    { key: "credential_url", label: "Credential URL", kind: "url" },
    { key: "credential_url_needs_verification", label: "Credential URL needs verification (hides the link)", kind: "checkbox" },
    { key: "certificate_file_url", label: "Certificate file URL", kind: "url", hint: "Copy from the Media library." },
    { key: "image_url", label: "Image or logo URL", kind: "url", hint: "Copy from the Media library." },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "is_featured", label: "Featured", kind: "checkbox" },
    { key: "is_published", label: "Published", kind: "checkbox" },
  ],
  nameOf: (row) => row.name,
  emptyMessage: "No certificates have been added yet.",
};

export const socialLinkConfig: EntityConfig<SocialLinkRecord> = {
  table: "social_links",
  title: "Social links",
  description: "Links shown in the sidebar and contact section. Disabled links are hidden from the site.",
  addLabel: "Add link",
  itemNoun: "social link",
  select: "*",
  orderColumn: "display_order",
  publishColumn: "is_published",
  columns: [
    { header: "Label", render: (row) => row.label },
    { header: "Platform", render: (row) => row.platform },
    { header: "Address", render: (row) => row.url ?? "-" },
  ],
  fields: [
    { key: "label", label: "Label", kind: "text", required: true, maxLength: 60 },
    { key: "platform", label: "Platform key", kind: "text", required: true, maxLength: 40, hint: "For example linkedin, github, email, phone." },
    { key: "url", label: "Address", kind: "url", hint: "https://, mailto:, or tel: link." },
    { key: "is_published", label: "Enabled", kind: "checkbox" },
  ],
  nameOf: (row) => row.label,
  emptyMessage: "No social links yet.",
};

export const consultationTypeConfig: EntityConfig<ConsultationTypeRecord> = {
  table: "consultation_types",
  title: "Consultation types",
  description: "The consultation options visitors can book. Only active types are shown on the booking page.",
  addLabel: "Add type",
  itemNoun: "consultation type",
  select: "*",
  orderColumn: "display_order",
  toggles: [{ column: "is_active", label: "Active" }],
  columns: [
    { header: "Name", render: (row) => row.name },
    { header: "Duration", render: (row) => `${row.duration_minutes} min` },
    { header: "Price", render: (row) => (row.price_amount === null ? "Not set" : `${row.price_amount.toFixed(2)} ${row.currency}`) },
  ],
  fields: [
    { key: "name", label: "Name", kind: "text", required: true, maxLength: 120 },
    { key: "description", label: "Description", kind: "textarea", maxLength: 1000 },
    { key: "duration_minutes", label: "Duration (minutes)", kind: "number", required: true, hint: "Between 15 and 480." },
    { key: "price_amount", label: "Price", kind: "number", hint: "Leave empty to show Price on request." },
    { key: "currency", label: "Currency", kind: "text", required: true, maxLength: 3, hint: "Three letters, for example USD." },
    { key: "is_active", label: "Active", kind: "checkbox" },
  ],
  nameOf: (row) => row.name,
  validate: (values: FormValues) => {
    const minutes = Number(values.duration_minutes);
    return minutes >= 15 && minutes <= 480 ? {} : { duration_minutes: "Duration must be between 15 and 480 minutes." };
  },
  emptyMessage: "No consultation types yet.",
};

export const availabilityRuleConfig: EntityConfig<AvailabilityRuleRecord> = {
  table: "availability_rules",
  title: "Weekly availability",
  description: "Times each week when consultations can be booked. Visitors only see open slots inside these windows.",
  addLabel: "Add availability",
  itemNoun: "availability window",
  select: "*",
  toggles: [{ column: "is_active", label: "Active" }],
  columns: [
    { header: "Day", render: (row) => DAY_OPTIONS.find((day) => day.value === String(row.day_of_week))?.label ?? "-" },
    { header: "Hours", render: (row) => `${row.start_time.slice(0, 5)} - ${row.end_time.slice(0, 5)}` },
    { header: "Time zone", render: (row) => row.timezone },
  ],
  fields: [
    { key: "day_of_week", label: "Day", kind: "select", required: true, numeric: true, options: DAY_OPTIONS },
    { key: "start_time", label: "Start time", kind: "time", required: true },
    { key: "end_time", label: "End time", kind: "time", required: true },
    { key: "timezone", label: "Time zone", kind: "text", required: true, maxLength: 64, hint: "For example Asia/Kolkata." },
    { key: "is_active", label: "Active", kind: "checkbox" },
  ],
  nameOf: (row) => DAY_OPTIONS[row.day_of_week]?.label ?? "availability",
  validate: (values: FormValues) => {
    const start = String(values.start_time ?? "");
    const end = String(values.end_time ?? "");
    return start && end && end <= start ? { end_time: "End time must be after the start time." } : {};
  },
  emptyMessage: "No availability windows yet. Without them, no consultation times are offered.",
};

export const availabilityBlockConfig: EntityConfig<AvailabilityBlockRecord> = {
  table: "availability_blocks",
  title: "Blocked periods",
  description: "Dates or time ranges when you are unavailable, such as holidays or travel.",
  addLabel: "Add blocked period",
  itemNoun: "blocked period",
  select: "*",
  columns: [
    { header: "From", render: (row) => formatDateTime(row.starts_at) },
    { header: "Until", render: (row) => formatDateTime(row.ends_at) },
    { header: "Reason", render: (row) => row.reason ?? "-" },
  ],
  fields: [
    { key: "starts_at", label: "From", kind: "datetime", required: true },
    { key: "ends_at", label: "Until", kind: "datetime", required: true },
    { key: "reason", label: "Reason", kind: "text", maxLength: 200 },
  ],
  nameOf: (row) => formatDateTime(row.starts_at),
  validate: (values: FormValues) => {
    const start = String(values.starts_at ?? "");
    const end = String(values.ends_at ?? "");
    return start && end && end <= start ? { ends_at: "The end must be after the start." } : {};
  },
  emptyMessage: "No blocked periods.",
};
