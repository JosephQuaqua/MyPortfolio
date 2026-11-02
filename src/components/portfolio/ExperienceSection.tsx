import { Link } from "react-router-dom";
import { AsyncContent } from "../ui/AsyncContent";
import { useExperiences } from "../../hooks/useCmsContent";
import { SectionShell } from "../ui/SectionShell";
import { formatDateRange } from "../../lib/dates";
import type { ExperienceRow } from "../../types/cms";

export function ExperienceSection() {
  const experiences = useExperiences();

  return (
    <SectionShell id="experience" number="02" title="Experience">
      <AsyncContent
        state={experiences}
        isEmpty={(items) => items.length === 0}
        emptyMessage="No experience has been published yet."
      >
        {(items) => (
          <ol className="experience-list">
            {items.map((item) => (
              <ExperienceEntry key={item.id} item={item} />
            ))}
          </ol>
        )}
      </AsyncContent>
    </SectionShell>
  );
}

function ExperienceEntry({ item }: { item: ExperienceRow }) {
  const dateRange = formatDateRange(
    item.start_date,
    item.end_date,
    item.is_current
  );

  const subtitle = [item.role, item.organization]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="experience-item">
      <div className="experience-item__date">
        {dateRange && <p>{dateRange}</p>}
      </div>

      <div className="experience-item__content">
        <h3 className="experience-item__title">
          {item.title}
        </h3>

        {subtitle && (
          <p className="experience-item__subtitle">
            {subtitle}
          </p>
        )}

        {item.description && (
          <p className="experience-item__description experience-item__preview">
            {item.description}
          </p>
        )}

        <Link
          to={`/experience/${item.id}`}
          className="experience-item__link"
        >
          View details
          <span aria-hidden="true"> ↗</span>
        </Link>
      </div>
    </li>
  );
}