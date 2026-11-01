import { useState } from "react";
import { AsyncContent } from "../../components/ui/AsyncContent";
import { useAsyncData } from "../../hooks/useAsyncData";
import { formatDateTime } from "./cmsConfigs";
import { listActivity } from "../../services/activity";

export function AdminActivityPage() {
  const activity = useAsyncData(() => listActivity(200));
  const [entityFilter, setEntityFilter] = useState("all");

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Activity</h1>
          <p className="admin-page__description">A record of every change made in the admin area, newest first.</p>
        </div>
      </header>

      <AsyncContent state={activity} isEmpty={(items) => items.length === 0} emptyMessage="No changes have been recorded yet.">
        {(items) => {
          const entities = Array.from(new Set(items.map((entry) => entry.entity))).sort();
          const visible = items.filter((entry) => entityFilter === "all" || entry.entity === entityFilter);
          return (
            <>
              <div className="admin-toolbar">
                <label className="admin-toolbar__field">
                  <span className="sr-only">Filter by section</span>
                  <select className="input input--compact" value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}>
                    <option value="all">All sections</option>
                    {entities.map((entity) => (
                      <option key={entity} value={entity}>
                        {entity}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">When</th>
                      <th scope="col">Who</th>
                      <th scope="col">Action</th>
                      <th scope="col">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((entry) => (
                      <tr key={entry.id}>
                        <td>{formatDateTime(entry.created_at)}</td>
                        <td>{entry.actor_email ?? "System"}</td>
                        <td>{entry.action}</td>
                        <td>{entry.entity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        }}
      </AsyncContent>
    </section>
  );
}
