import { Link } from "react-router-dom";
import { AsyncContent } from "../ui/AsyncContent";
import { SafeLink } from "../ui/SafeLink";
import { TagList } from "../ui/TagList";
import { SectionShell } from "../ui/SectionShell";
import { useProjects } from "../../hooks/useCmsContent";
import { PROJECT_STATUS_LABELS } from "../../lib/labels";
import type { ProjectWithDetails } from "../../types/cms";

export function ProjectsSection() {
  const projects = useProjects();
  return (
    <SectionShell id="projects" number="03" title="Projects">
      <AsyncContent
        state={projects}
        isEmpty={(items) => items.length === 0}
        emptyMessage="No projects have been published yet."
      >
        {(items) => {
          const featured = items.filter((project) => project.is_featured);
          const others = items.filter((project) => !project.is_featured);
          return (
            <>
              {featured.length > 0 && (
                <ul className="project-grid">
                  {featured.map((project) => (
                    <li key={project.id}>
                      <ProjectCard project={project} />
                    </li>
                  ))}
                </ul>
              )}
              {others.length > 0 && (
                <div className="more-projects">
                  <h3 className="subheading">More projects</h3>
                  <ul className="more-projects__list">
                    {others.map((project) => (
                      <li key={project.id} className="more-projects__item">
                        <Link to={`/projects/${project.slug}`} className="more-projects__title">
                          {project.title}
                        </Link>
                        <span className="mono-label entry__muted">{PROJECT_STATUS_LABELS[project.project_status]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          );
        }}
      </AsyncContent>
    </SectionShell>
  );
}

export function ProjectCard({ project }: { project: ProjectWithDetails }) {
  const detailPath = `/projects/${project.slug}`;
  const meta = [project.category, project.year ? String(project.year) : null].filter(Boolean).join(" · ");
  const technologies = project.project_technologies.map((technology) => technology.name);

  return (
    <article className="project-card">
      {project.cover_image_url && (
        <Link to={detailPath} className="project-card__media" tabIndex={-1} aria-hidden="true">
          <img src={project.cover_image_url} alt="" loading="lazy" />
        </Link>
      )}
      <div className="project-card__body">
        {meta && <p className="mono-label">{meta}</p>}
        <h3 className="project-card__title">
          <Link to={detailPath}>{project.title}</Link>
        </h3>
        {project.subtitle && <p className="project-card__subtitle">{project.subtitle}</p>}
        {project.short_description && <p className="project-card__text">{project.short_description}</p>}
        <TagList items={technologies} label="Technologies" />
        <div className="project-card__footer">
          <span className="status-pill" data-status={project.project_status}>
            {PROJECT_STATUS_LABELS[project.project_status]}
          </span>
          <div className="project-card__links">
            <Link to={detailPath} className="text-link">
              Case study
            </Link>
            <SafeLink url={project.live_url} className="text-link">
              Live site
            </SafeLink>
            <SafeLink url={project.github_url} className="text-link">
              GitHub
            </SafeLink>
          </div>
        </div>
      </div>
    </article>
  );
}
