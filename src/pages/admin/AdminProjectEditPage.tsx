import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AsyncContent } from "../../components/ui/AsyncContent";
import { ProjectForm } from "../../components/admin/ProjectForm";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useIsAdmin } from "../../context/AdminAuthContext";
import { emptyProjectForm, toProjectFormValues } from "../../lib/projectForm";
import { deleteProject, fetchAdminProject } from "../../services/adminProjects";

export function AdminProjectEditPage() {
  const { id } = useParams();
  if (!id) return <NewProject />;
  return <ExistingProject id={id} />;
}

function NewProject() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <Link to="/admin/projects" className="back-link">
            Back to projects
          </Link>
          <h1 className="admin-page__title">New project</h1>
        </div>
      </header>
      <ProjectForm projectId={null} initialValues={emptyProjectForm()} />
    </section>
  );
}

function ExistingProject({ id }: { id: string }) {
  const project = useAsyncData(() => fetchAdminProject(id), [id]);
  const isAdmin = useIsAdmin();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <Link to="/admin/projects" className="back-link">
            Back to projects
          </Link>
          <h1 className="admin-page__title">{project.data?.title ?? "Edit project"}</h1>
          {project.data?.publication_status === "published" && (
            <Link to={`/projects/${project.data.slug}`} className="text-link">
              View public page
            </Link>
          )}
        </div>
      </header>
      <AsyncContent state={project} isEmpty={() => false} emptyMessage="This project could not be found.">
        {(data) => (
          <>
            <ProjectForm key={data.id} projectId={data.id} initialValues={toProjectFormValues(data)} />
            {isAdmin && <DeleteProject id={data.id} title={data.title} />}
          </>
        )}
      </AsyncContent>
    </section>
  );
}

function DeleteProject({ id, title }: { id: string; title: string }) {
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProject(id);
      navigate("/admin/projects", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The project could not be deleted. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="admin-danger">
      <h2 className="admin-danger__title">Delete project</h2>
      <p className="admin-danger__text">
        Deleting removes {title} and its technologies from the site. This cannot be undone.
      </p>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      {isConfirming ? (
        <div className="admin-danger__actions">
          <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, delete this project"}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setIsConfirming(false)} disabled={isDeleting}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--ghost" onClick={() => setIsConfirming(true)}>
          Delete project
        </button>
      )}
    </div>
  );
}
