import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { AsyncContent } from "../components/ui/AsyncContent";
import { Markdown } from "../components/ui/Markdown";
import { SafeLink } from "../components/ui/SafeLink";
import { TagList } from "../components/ui/TagList";
import { ProjectCard } from "../components/portfolio/ProjectsSection";
import { useSiteContent } from "../context/SiteContentContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useProject, useProjects } from "../hooks/useCmsContent";
import { formatDateRange } from "../lib/dates";
import { PROJECT_STATUS_LABELS } from "../lib/labels";
import type { ProjectWithDetails } from "../types/cms";

export function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const project = useProject(slug);
  const { settings } = useSiteContent();
  const canonicalBase = settings.data?.canonical_url?.replace(/\/$/, "");

  useDocumentMeta({
    title: project.data?.title ?? "Project",
    description: project.data?.short_description,
    imageUrl: project.data?.cover_image_url,
    canonicalUrl: canonicalBase ? `${canonicalBase}/projects/${slug}` : null,
  });

  return (
    <article className="project-detail">
      <Link to="/#projects" className="back-link">
        Back to projects
      </Link>
      <AsyncContent state={project} isEmpty={() => false} emptyMessage="This project could not be found.">
        {(data) => <ProjectDetail project={data} />}
      </AsyncContent>
      <RelatedProjects currentSlug={slug} />
    </article>
  );
}

function ProjectDetail({ project }: { project: ProjectWithDetails }) {
  const dateText =
    formatDateRange(project.start_date, project.completion_date, false) ??
    (project.year ? String(project.year) : null);
  const technologies = project.project_technologies.map((technology) => technology.name);

  return (
    <>
      <header className="project-hero">
        {project.category && <p className="mono-label">{project.category}</p>}
        <h1 className="project-hero__title">{project.title}</h1>
        {project.subtitle && <p className="project-hero__subtitle">{project.subtitle}</p>}
        <dl className="project-meta">
          {project.role && (
            <div>
              <dt className="mono-label">Role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          {dateText && (
            <div>
              <dt className="mono-label">Date</dt>
              <dd>{dateText}</dd>
            </div>
          )}
          <div>
            <dt className="mono-label">Status</dt>
            <dd>{PROJECT_STATUS_LABELS[project.project_status]}</dd>
          </div>
        </dl>
        {(project.live_url || project.github_url) && (
          <div className="project-hero__actions">
            <SafeLink url={project.live_url} className="btn btn--primary">
              Visit live site
            </SafeLink>
            <SafeLink url={project.github_url} className="btn btn--ghost">
              View on GitHub
            </SafeLink>
          </div>
        )}
      </header>

      {project.cover_image_url && (
        <figure className="project-cover">
          <img src={project.cover_image_url} alt={project.title} />
        </figure>
      )}

      {project.long_description && (
        <DetailBlock title="Overview">
          <Markdown>{project.long_description}</Markdown>
        </DetailBlock>
      )}
      {project.challenges && (
        <DetailBlock title="Challenges">
          <Markdown>{project.challenges}</Markdown>
        </DetailBlock>
      )}
      {project.solution && (
        <DetailBlock title="Solution">
          <Markdown>{project.solution}</Markdown>
        </DetailBlock>
      )}
      {project.key_features.length > 0 && (
        <DetailBlock title="Key features">
          <ul className="bullets">
            {project.key_features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </DetailBlock>
      )}
      {project.technical_contributions.length > 0 && (
        <DetailBlock title="Technical implementation">
          <ul className="bullets">
            {project.technical_contributions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailBlock>
      )}
      {project.technical_decisions && (
        <DetailBlock title="Architecture and technical decisions">
          <Markdown>{project.technical_decisions}</Markdown>
        </DetailBlock>
      )}
      {project.outcome && (
        <DetailBlock title="Outcome">
          <Markdown>{project.outcome}</Markdown>
        </DetailBlock>
      )}
      {technologies.length > 0 && (
        <DetailBlock title="Technology stack">
          <TagList items={technologies} label="Technology stack" />
        </DetailBlock>
      )}
      {project.project_images.length > 0 && (
        <DetailBlock title="Gallery">
          <ul className="gallery">
            {project.project_images.map((image) => (
              <li key={image.id} className="gallery__item">
                <img src={image.image_url} alt={image.alt_text} loading="lazy" />
                {image.caption && <p className="gallery__caption">{image.caption}</p>}
              </li>
            ))}
          </ul>
        </DetailBlock>
      )}
    </>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="detail-block">
      <h2 className="detail-block__title">{title}</h2>
      {children}
    </section>
  );
}

function RelatedProjects({ currentSlug }: { currentSlug: string }) {
  const projects = useProjects();
  return (
    <section className="detail-block related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="detail-block__title">
        Related projects
      </h2>
      <AsyncContent
        state={projects}
        isEmpty={(items) => items.filter((item) => item.slug !== currentSlug).length === 0}
        emptyMessage="No other projects have been published yet."
      >
        {(items) => (
          <ul className="project-grid">
            {items
              .filter((item) => item.slug !== currentSlug)
              .slice(0, 3)
              .map((item) => (
                <li key={item.id}>
                  <ProjectCard project={item} />
                </li>
              ))}
          </ul>
        )}
      </AsyncContent>
    </section>
  );
}
