import { useState } from "react";
import { Link } from "react-router-dom";
import { AsyncContent } from "../../components/ui/AsyncContent";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchAdminProjects, setProjectFeatured, setProjectPublicationStatus, swapProjectOrder } from "../../services/adminProjects";
import { PROJECT_STATUS_LABELS } from "../../lib/labels";
import type { AdminProjectListItem } from "../../types/admin";
import type { PublicationStatus } from "../../types/cms";

const VISIBILITY_LABELS: Record<PublicationStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function AdminProjectsPage() {
  const projects = useAsyncData(fetchAdminProjects);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function runAction(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      projects.reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "The change could not be saved. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="mono-label">Content</p>
          <h1 className="admin-page__title">Projects</h1>
        </div>
        <Link to="/admin/projects/new" className="btn btn--primary">
          New project
        </Link>
      </header>

      {actionError && (
        <p className="form__error" role="alert">
          {actionError}
        </p>
      )}

      <AsyncContent
        state={projects}
        isEmpty={(items) => items.length === 0}
        emptyMessage="No projects yet. Create your first project to show it on the site."
      >
        {(items) => (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Project</th>
                  <th scope="col">Status</th>
                  <th scope="col">Visibility</th>
                  <th scope="col">Featured</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((project, index) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    isBusy={busyId === project.id}
                    onMove={(direction) => {
                      const neighbor = items[index + direction];
                      if (!neighbor) return;
                      void runAction(project.id, () =>
                        swapProjectOrder(
                          { id: project.id, display_order: project.display_order },
                          { id: neighbor.id, display_order: neighbor.display_order },
                        ),
                      );
                    }}
                    onVisibilityChange={(status) =>
                      void runAction(project.id, () => setProjectPublicationStatus(project.id, status))
                    }
                    onFeaturedChange={(isFeatured) =>
                      void runAction(project.id, () => setProjectFeatured(project.id, isFeatured))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncContent>
    </section>
  );
}

interface ProjectRowProps {
  project: AdminProjectListItem;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onMove: (direction: -1 | 1) => void;
  onVisibilityChange: (status: PublicationStatus) => void;
  onFeaturedChange: (isFeatured: boolean) => void;
}

function ProjectRow({ project, isFirst, isLast, isBusy, onMove, onVisibilityChange, onFeaturedChange }: ProjectRowProps) {
  return (
    <tr data-busy={isBusy}>
      <td>
        <div className="admin-reorder">
          <button
            type="button"
            className="icon-button"
            onClick={() => onMove(-1)}
            disabled={isFirst || isBusy}
            aria-label={`Move ${project.title} up`}
          >
            ▲
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => onMove(1)}
            disabled={isLast || isBusy}
            aria-label={`Move ${project.title} down`}
          >
            ▼
          </button>
        </div>
      </td>
      <td>
        <p className="admin-table__primary">{project.title}</p>
        <p className="admin-table__secondary mono-label">/projects/{project.slug}</p>
      </td>
      <td>{PROJECT_STATUS_LABELS[project.project_status]}</td>
      <td>
        <select
          className="input input--compact"
          value={project.publication_status}
          disabled={isBusy}
          aria-label={`Visibility of ${project.title}`}
          onChange={(event) => onVisibilityChange(event.target.value as PublicationStatus)}
        >
          {(Object.keys(VISIBILITY_LABELS) as PublicationStatus[]).map((status) => (
            <option key={status} value={status}>
              {VISIBILITY_LABELS[status]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="checkbox"
          checked={project.is_featured}
          disabled={isBusy}
          aria-label={`Feature ${project.title}`}
          onChange={(event) => onFeaturedChange(event.target.checked)}
        />
      </td>
      <td className="admin-table__actions">
        <Link to={`/admin/projects/${project.id}`} className="text-link">
          Edit
        </Link>
      </td>
    </tr>
  );
}
