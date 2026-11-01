import { useState, type ChangeEvent } from "react";
import { AsyncContent } from "../../components/ui/AsyncContent";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useIsAdmin } from "../../context/AdminAuthContext";
import { deleteCv, fetchStoredCvUrl, uploadCv } from "../../services/cvFile";
import { fetchSiteSettings, updateSiteSettings } from "../../services/siteContent";

interface CvState {
  settingsId: number;
  isPublished: boolean;
  fileUrl: string | null;
}

async function loadCvState(): Promise<CvState> {
  const settings = await fetchSiteSettings();
  if (!settings) throw new Error("Site settings could not be loaded.");
  const fileUrl = await fetchStoredCvUrl(settings.cv_url);
  return { settingsId: settings.id, isPublished: settings.cv_is_published, fileUrl };
}

export function AdminCvPage() {
  const cv = useAsyncData(loadCvState);
  const isAdmin = useIsAdmin();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function run(action: () => Promise<void>, successText: string) {
    setIsBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: "success", text: successText });
      cv.reload();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "The change could not be saved." });
    } finally {
      setIsBusy(false);
    }
  }

  function handleFile(state: CvState, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void run(async () => {
      const path = await uploadCv(file);
      await updateSiteSettings(state.settingsId, { cv_url: path });
    }, state.fileUrl ? "CV replaced." : "CV uploaded. Publish it when you are ready.");
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">CV</h1>
          <p className="admin-page__description">The PDF behind the Download CV button. The button only appears on the site while the CV is published.</p>
        </div>
      </header>

      {message && (
        <p className={message.kind === "success" ? "form__success" : "form__error"} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      )}

      <AsyncContent state={cv} isEmpty={() => false} emptyMessage="The CV settings could not be loaded.">
        {(state) => (
          <div className="admin-form-section">
            <p className="admin-page__description">
              {state.fileUrl ? "A CV file is stored." : "No CV file has been uploaded yet."}
            </p>

            <div className="form__actions">
              <label className={`btn btn--ghost${isBusy ? " btn--disabled" : ""}`}>
                {state.fileUrl ? "Replace PDF" : "Upload PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  disabled={isBusy}
                  onChange={(event) => handleFile(state, event)}
                />
              </label>
              {state.fileUrl && (
                <a className="text-link" href={state.fileUrl} target="_blank" rel="noreferrer">
                  View current PDF
                </a>
              )}
            </div>

            {state.fileUrl && (
              <div className="form__actions">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={state.isPublished}
                    disabled={isBusy}
                    onChange={(event) =>
                      void run(
                        () => updateSiteSettings(state.settingsId, { cv_is_published: event.target.checked }),
                        event.target.checked ? "CV published. The download button is now visible." : "CV unpublished. The download button is hidden.",
                      )
                    }
                  />
                  <span>Show the Download CV button on the site</span>
                </label>
              </div>
            )}

            {state.fileUrl && isAdmin && (
              <div className="form__actions">
                {confirmingDelete ? (
                  <span className="admin-inline-confirm">
                    <button
                      type="button"
                      className="text-link text-link--danger"
                      disabled={isBusy}
                      onClick={() => {
                        setConfirmingDelete(false);
                        void run(async () => {
                          await deleteCv();
                          await updateSiteSettings(state.settingsId, { cv_url: null, cv_is_published: false });
                        }, "CV deleted.");
                      }}
                    >
                      Confirm delete
                    </button>
                    <button type="button" className="text-link" onClick={() => setConfirmingDelete(false)}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button type="button" className="text-link text-link--danger" disabled={isBusy} onClick={() => setConfirmingDelete(true)}>
                    Delete CV
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </AsyncContent>
    </section>
  );
}
