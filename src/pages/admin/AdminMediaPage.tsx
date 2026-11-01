import { useState, type ChangeEvent } from "react";
import { AsyncContent } from "../../components/ui/AsyncContent";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useIsAdmin } from "../../context/AdminAuthContext";
import { deleteMedia, listMedia, uploadMedia } from "../../services/media";

export function AdminMediaPage() {
  const media = useAsyncData(listMedia);
  const isAdmin = useIsAdmin();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [confirmingName, setConfirmingName] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setIsBusy(true);
    setMessage(null);
    try {
      await uploadMedia(file);
      setMessage({ kind: "success", text: "Image uploaded. Copy its link to use it on a project, certificate, or the site." });
      media.reload();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "The image could not be uploaded." });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(name: string) {
    setConfirmingName(null);
    setIsBusy(true);
    setMessage(null);
    try {
      await deleteMedia(name);
      setMessage({ kind: "success", text: "Image deleted. Anything still linking to it will show a broken image." });
      media.reload();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "The image could not be deleted." });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
    } catch {
      setMessage({ kind: "error", text: "The link could not be copied. Select it and copy it manually." });
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Media</h1>
          <p className="admin-page__description">Images for projects, certificates, and the site. Copy a link to use it elsewhere.</p>
        </div>
        <label className={`btn btn--primary${isBusy ? " btn--disabled" : ""}`}>
          Upload image
          <input type="file" accept="image/*" className="sr-only" disabled={isBusy} onChange={(event) => void handleUpload(event)} />
        </label>
      </header>

      {message && (
        <p className={message.kind === "success" ? "form__success" : "form__error"} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      )}

      <AsyncContent state={media} isEmpty={(items) => items.length === 0} emptyMessage="No images yet. Upload one to get started.">
        {(items) => (
          <ul className="admin-media-grid">
            {items.map((item) => (
              <li key={item.name} className="admin-media-card">
                <img src={item.url} alt="" loading="lazy" className="admin-media-card__image" />
                <div className="admin-media-card__actions">
                  <button type="button" className="text-link" onClick={() => void handleCopy(item.url)}>
                    {copiedUrl === item.url ? "Link copied" : "Copy link"}
                  </button>
                  {isAdmin &&
                    (confirmingName === item.name ? (
                      <span className="admin-inline-confirm">
                        <button type="button" className="text-link text-link--danger" disabled={isBusy} onClick={() => void handleDelete(item.name)}>
                          Confirm delete
                        </button>
                        <button type="button" className="text-link" onClick={() => setConfirmingName(null)}>
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button type="button" className="text-link text-link--danger" disabled={isBusy} onClick={() => setConfirmingName(item.name)}>
                        Delete
                      </button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AsyncContent>
    </section>
  );
}
