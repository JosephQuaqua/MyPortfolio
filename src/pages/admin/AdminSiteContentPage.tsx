import { AsyncContent } from "../../components/ui/AsyncContent";
import { SingletonEditor } from "../../components/admin/SingletonEditor";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { FieldConfig } from "../../lib/recordForm";
import { fetchProfile, updateProfile } from "../../services/siteContent";
import type { ProfileRow } from "../../types/cms";

const PROFILE_FIELDS: FieldConfig[] = [
  { key: "full_name", label: "Full name", kind: "text", required: true, maxLength: 120 },
  { key: "professional_title", label: "Professional title", kind: "text", maxLength: 120 },
  { key: "headline", label: "Headline", kind: "text", maxLength: 160 },
  { key: "summary", label: "Summary", kind: "textarea", maxLength: 2000 },
  { key: "location", label: "Location", kind: "text", maxLength: 120 },
  { key: "availability_status", label: "Availability status", kind: "text", maxLength: 120, hint: "For example Open to opportunities." },
  { key: "is_available", label: "Show as available", kind: "checkbox" },
  { key: "profile_image_url", label: "Profile image URL", kind: "url", hint: "Copy from the Media library." },
  { key: "primary_cta_label", label: "Primary button label", kind: "text", maxLength: 60 },
  { key: "primary_cta_url", label: "Primary button link", kind: "url" },
  { key: "secondary_cta_label", label: "Secondary button label", kind: "text", maxLength: 60 },
  { key: "secondary_cta_url", label: "Secondary button link", kind: "url" },
  { key: "contact_email", label: "Contact email", kind: "email" },
  { key: "contact_phone", label: "Contact phone", kind: "text", maxLength: 40, hint: "Shown on the contact section as written." },
];

export function AdminSiteContentPage() {
  const profile = useAsyncData(fetchProfile);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Site content</h1>
          <p className="admin-page__description">Your name, headline, summary, call-to-action buttons, and contact details shown across the site.</p>
        </div>
      </header>
      <AsyncContent state={profile} isEmpty={() => false} emptyMessage="Your profile could not be loaded. Check the database has a profile row.">
        {(row: ProfileRow) => (
          <SingletonEditor
            key={row.id}
            title="Profile"
            fields={PROFILE_FIELDS}
            record={row as unknown as Record<string, unknown>}
            onSave={(payload) => updateProfile(row.id, payload as Partial<ProfileRow>)}
          />
        )}
      </AsyncContent>
    </section>
  );
}
