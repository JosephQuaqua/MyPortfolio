import { Link, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { fetchExperienceById } from "../services/experiences";
import { AsyncContent } from "../components/ui/AsyncContent";
import { TagList } from "../components/ui/TagList";
import { formatDateRange } from "../lib/dates";

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const experience = useAsyncData(
    () =>
      id
        ? fetchExperienceById(id)
        : Promise.reject(new Error("Experience not found.")),
    [id]
  );

  return (
    <main className="experience-detail">
      <Link to="/#experience" className="experience-detail__back">
        ← Back to experience
      </Link>

      <AsyncContent
        state={experience}
        isEmpty={() => false}
        emptyMessage="Experience not found."
      >
        {(item) => {
          const dateRange = formatDateRange(
            item.start_date,
            item.end_date,
            item.is_current
          );

          const subtitle = [item.role, item.organization]
            .filter(Boolean)
            .join(" · ");

          return (
            <article className="experience-detail__article">
              <p className="experience-detail__eyebrow">
                {item.experience_type}
              </p>

              {dateRange && (
                <p className="experience-detail__date">{dateRange}</p>
              )}

              <h1 className="experience-detail__title">{item.title}</h1>

              {subtitle && (
                <p className="experience-detail__subtitle">{subtitle}</p>
              )}

              {item.location && (
                <p className="experience-detail__location">{item.location}</p>
              )}

              {item.description && (
                <section className="experience-detail__section">
                  <h2>Overview</h2>
                  <p>{item.description}</p>
                </section>
              )}

              {item.achievements.length > 0 && (
                <section className="experience-detail__section">
                  <h2>Responsibilities & Achievements</h2>
                  <ul className="experience-detail__achievements">
                    {item.achievements.map((achievement, index) => (
                      <li key={`${item.id}-${index}`}>{achievement}</li>
                    ))}
                  </ul>
                </section>
              )}

              {item.technologies.length > 0 && (
                <section className="experience-detail__section">
                  <h2>Technologies</h2>
                  <TagList items={item.technologies} label="Technologies used" />
                </section>
              )}

              {(item.live_url || item.github_url) && (
                <div className="experience-detail__links">
                  {item.live_url && (
                    <a href={item.live_url} target="_blank" rel="noreferrer">
                      Live project ↗
                    </a>
                  )}
                  {item.github_url && (
                    <a href={item.github_url} target="_blank" rel="noreferrer">
                      GitHub ↗
                    </a>
                  )}
                </div>
              )}
            </article>
          );
        }}
      </AsyncContent>
    </main>
  );
}