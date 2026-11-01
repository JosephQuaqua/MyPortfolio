import { useState, type ReactNode } from "react";
import { AsyncContent } from "../ui/AsyncContent";
import { AdminDrawer } from "./AdminDrawer";
import { RecordEditor } from "./RecordEditor";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useIsAdmin } from "../../context/AdminAuthContext";
import type { FieldConfig, FormErrors, FormValues, SelectOption } from "../../lib/recordForm";
import { deleteRow, listRows, swapDisplayOrder, updateRow } from "../../services/cmsTable";

export interface EntityColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export interface EntityToggle {
  column: string;
  label: string;
}

export interface EntityConfig<T extends { id: string }> {
  table: string;
  title: string;
  description: string;
  addLabel: string;
  itemNoun: string;
  select: string;
  orderColumn?: string;
  publishColumn?: string;
  toggles?: EntityToggle[];
  columns: EntityColumn<T>[];
  fields: FieldConfig[];
  nameOf: (row: T) => string;
  validate?: (values: FormValues) => FormErrors;
  loadOptions?: () => Promise<Record<string, SelectOption[]>>;
  emptyMessage: string;
}

type EditState = { mode: "new" } | { mode: "edit"; id: string } | null;

export function EntityManager<T extends { id: string }>({ config }: { config: EntityConfig<T> }) {
  const isAdmin = useIsAdmin();
  const rows = useAsyncData(
    () => listRows<T>(config.table, config.select, `${config.title} could not be loaded.`, config.orderColumn ? { column: config.orderColumn } : undefined),
    [config.table],
  );
  const options = useAsyncData(async () => (config.loadOptions ? config.loadOptions() : {}), [config.table]);
  const [editState, setEditState] = useState<EditState>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = rows.data ?? [];
  const editingRow = editState?.mode === "edit" ? items.find((row) => row.id === editState.id) ?? null : null;

  async function runAction(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      rows.reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "The change could not be saved. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function handleMove(index: number, direction: -1 | 1) {
    const current = items[index];
    const neighbor = items[index + direction];
    if (!current || !neighbor || !config.orderColumn) return;
    const column = config.orderColumn;
    void runAction(current.id, () =>
      swapDisplayOrder(
        config.table,
        { id: current.id, display_order: Number(current[column as keyof T] ?? 0) },
        { id: neighbor.id, display_order: Number(neighbor[column as keyof T] ?? 0) },
        `${config.title} order could not be changed.`,
      ),
    );
  }

  function handleDelete(id: string) {
    void runAction(id, () => deleteRow(config.table, id, `${config.itemNoun} could not be deleted. It may still be in use, or your account may not have permission.`));
    setConfirmingId(null);
  }

  const nextOrder = config.orderColumn ? Math.max(0, ...items.map((row) => Number(row[config.orderColumn as keyof T] ?? 0))) + 1 : null;

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{config.title}</h1>
          <p className="admin-page__description">{config.description}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditState({ mode: "new" })}>
          {config.addLabel}
        </button>
      </header>

      {actionError && (
        <p className="form__error" role="alert">
          {actionError}
        </p>
      )}

      <AsyncContent state={rows} isEmpty={(list) => list.length === 0} emptyMessage={config.emptyMessage}>
        {(list) => (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {config.orderColumn && (
                    <th scope="col">Order</th>
                  )}
                  {config.columns.map((column) => (
                    <th key={column.header} scope="col">
                      {column.header}
                    </th>
                  ))}
                  {config.publishColumn && <th scope="col">Published</th>}
                  {config.toggles?.map((toggle) => (
                    <th key={toggle.column} scope="col">
                      {toggle.label}
                    </th>
                  ))}
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, index) => {
                  const name = config.nameOf(row);
                  const isBusy = busyId === row.id;
                  const flags = row as unknown as Record<string, unknown>;
                  return (
                    <tr key={row.id} data-busy={isBusy}>
                      {config.orderColumn && (
                        <td>
                          <div className="admin-reorder">
                            <button type="button" className="icon-button" onClick={() => handleMove(index, -1)} disabled={index === 0 || isBusy} aria-label={`Move ${name} up`}>
                              ▲
                            </button>
                            <button type="button" className="icon-button" onClick={() => handleMove(index, 1)} disabled={index === list.length - 1 || isBusy} aria-label={`Move ${name} down`}>
                              ▼
                            </button>
                          </div>
                        </td>
                      )}
                      {config.columns.map((column) => (
                        <td key={column.header}>{column.render(row)}</td>
                      ))}
                      {config.publishColumn && (
                        <td>
                          <input
                            type="checkbox"
                            checked={flags[config.publishColumn] === true}
                            disabled={isBusy}
                            aria-label={`${name} published`}
                            onChange={(event) =>
                              void runAction(row.id, () => updateRow(config.table, row.id, { [config.publishColumn as string]: event.target.checked }, "The visibility could not be changed."))
                            }
                          />
                        </td>
                      )}
                      {config.toggles?.map((toggle) => (
                        <td key={toggle.column}>
                          <input
                            type="checkbox"
                            checked={flags[toggle.column] === true}
                            disabled={isBusy}
                            aria-label={`${toggle.label} for ${name}`}
                            onChange={(event) =>
                              void runAction(row.id, () => updateRow(config.table, row.id, { [toggle.column]: event.target.checked }, "The change could not be saved."))
                            }
                          />
                        </td>
                      ))}
                      <td className="admin-table__actions">
                        <button type="button" className="text-link" onClick={() => setEditState({ mode: "edit", id: row.id })}>
                          Edit
                        </button>
                        {isAdmin &&
                          (confirmingId === row.id ? (
                            <span className="admin-inline-confirm">
                              <button type="button" className="text-link text-link--danger" onClick={() => handleDelete(row.id)}>
                                Confirm delete
                              </button>
                              <button type="button" className="text-link" onClick={() => setConfirmingId(null)}>
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button type="button" className="text-link text-link--danger" onClick={() => setConfirmingId(row.id)}>
                              Delete
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AsyncContent>

      {editState && (editState.mode === "new" || editingRow) && (
        <AdminDrawer title={editState.mode === "new" ? config.addLabel : `Edit ${config.itemNoun}`} onClose={() => setEditState(null)}>
          <AsyncContent state={options} isEmpty={() => false} emptyMessage="Options could not be loaded.">
            {(optionsByKey) => (
              <RecordEditor
                key={editState.mode === "new" ? "new" : editState.id}
                table={config.table}
                title={config.itemNoun}
                fields={config.fields}
                record={editingRow as unknown as Record<string, unknown> | null}
                recordId={editingRow ? editingRow.id : null}
                nextDisplayOrder={nextOrder}
                optionsByKey={optionsByKey}
                validate={config.validate}
                onSaved={() => {
                  setEditState(null);
                  rows.reload();
                }}
              />
            )}
          </AsyncContent>
        </AdminDrawer>
      )}
    </section>
  );
}
