import { AsyncContent } from "../../components/ui/AsyncContent";
import { SingletonEditor } from "../../components/admin/SingletonEditor";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { FieldConfig } from "../../lib/recordForm";
import { fetchSiteSettings, updateSiteSettings } from "../../services/siteContent";
import type { SiteSettingsRow } from "../../types/cms";

const SETTINGS_FIELDS: FieldConfig[] = [
  { key: "site_title", label: "Site title", kind: "text", maxLength: 70, hint: "Shown in the browser tab and search results." },
  { key: "meta_description", label: "Meta description", kind: "textarea", maxLength: 160, hint: "A short summary for search results." },
  { key: "og_title", label: "Social share title", kind: "text", maxLength: 95 },
  { key: "og_description", label: "Social share description", kind: "textarea", maxLength: 200 },
  { key: "og_image_url", label: "Social share image URL", kind: "url", hint: "Copy from the Media library." },
  { key: "favicon_url", label: "Favicon URL", kind: "url", hint: "Copy from the Media library." },
  { key: "canonical_url", label: "Canonical site URL", kind: "url", hint: "The main address of your site, for example https://example.com." },
  { key: "footer_text", label: "Footer text", kind: "textarea", maxLength: 300 },
];

export function AdminSettingsPage() {
  const settings = useAsyncData(fetchSiteSettings);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Settings</h1>
          <p className="admin-page__description">Search, social sharing, and footer settings for the whole site.</p>
        </div>
      </header>
      <AsyncContent state={settings} isEmpty={() => false} emptyMessage="Site settings could not be loaded. Check the database has a settings row.">
        {(row: SiteSettingsRow) => (
          <SingletonEditor
            key={row.id}
            title="Settings"
            fields={SETTINGS_FIELDS}
            record={row as unknown as Record<string, unknown>}
            onSave={(payload) => updateSiteSettings(row.id, payload as Partial<SiteSettingsRow>)}
          />
        )}
      </AsyncContent>
    </section>
  );
}
