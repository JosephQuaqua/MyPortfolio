import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AsyncContent } from "../ui/AsyncContent";
import { AdminDrawer } from "./AdminDrawer";
import { Field } from "../forms/FormFields";
import { useAsyncData } from "../../hooks/useAsyncData";

export interface TriageRecord {
  id: string;
  status: string;
  admin_notes: string | null;
}

export interface TriageColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export interface TriageConfig<T extends TriageRecord> {
  title: string;
  description: string;
  emptyMessage: string;
  statuses: readonly string[];
  load: () => Promise<T[]>;
  save: (id: string, values: { status: string; admin_notes: string | null }) => Promise<void>;
  columns: TriageColumn<T>[];
  searchText: (row: T) => string;
  detail: (row: T) => ReactNode;
}

function labelFor(value: string): string {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function TriageManager<T extends TriageRecord>({ config }: { config: TriageConfig<T> }) {
  const rows = useAsyncData(config.load, [config.title]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const items = rows.data ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (row) =>
        (statusFilter === "all" || row.status === statusFilter) &&
        (needle === "" || config.searchText(row).toLowerCase().includes(needle)),
    );
  }, [items, statusFilter, query, config]);

  const selected = selectedId ? items.find((row) => row.id === selectedId) ?? null : null;

  function openRow(row: T) {
    setSelectedId(row.id);
    setDraftStatus(row.status);
    setDraftNotes(row.admin_notes ?? "");
    setSaveError(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await config.save(selected.id, { status: draftStatus, admin_notes: draftNotes.trim() || null });
      setSelectedId(null);
      rows.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "The change could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{config.title}</h1>
          <p className="admin-page__description">{config.description}</p>
        </div>
      </header>

      <div className="admin-toolbar">
        <label className="admin-toolbar__field">
          <span className="sr-only">Search</span>
          <input
            type="search"
            className="input input--compact"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-toolbar__field">
          <span className="sr-only">Filter by status</span>
          <select className="input input--compact" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            {config.statuses.map((status) => (
              <option key={status} value={status}>
                {labelFor(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AsyncContent state={rows} isEmpty={() => items.length === 0} emptyMessage={config.emptyMessage}>
        {() =>
          filtered.length === 0 ? (
            <p className="admin-page__description">No entries match these filters.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {config.columns.map((column) => (
                      <th key={column.header} scope="col">
                        {column.header}
                      </th>
                    ))}
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      {config.columns.map((column, index) => (
                        <td key={column.header}>
                          {index === 0 ? (
                            <button type="button" className="text-link" onClick={() => openRow(row)}>
                              {column.render(row)}
                            </button>
                          ) : (
                            column.render(row)
                          )}
                        </td>
                      ))}
                      <td>{labelFor(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </AsyncContent>

      {selected && (
        <AdminDrawer title={`${config.title} details`} onClose={() => setSelectedId(null)}>
          <div className="admin-detail">{config.detail(selected)}</div>
          <form className="admin-project-form" onSubmit={(event) => void handleSave(event)}>
            <Field id="triage-status" label="Status">
              <select id="triage-status" className="input" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
                {config.statuses.map((status) => (
                  <option key={status} value={status}>
                    {labelFor(status)}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="triage-notes" label="Private notes" hint="Notes are only visible to admins.">
              <textarea id="triage-notes" className="input" rows={5} maxLength={5000} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} />
            </Field>
            {saveError && (
              <p className="form__error" role="alert">
                {saveError}
              </p>
            )}
            <div className="form__actions">
              <button type="submit" className="btn btn--primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </AdminDrawer>
      )}
    </section>
  );
}
