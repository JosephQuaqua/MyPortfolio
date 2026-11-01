import { AsyncContent } from "../ui/AsyncContent";
import { SectionShell } from "../ui/SectionShell";
import { TagList } from "../ui/TagList";
import { useEducation } from "../../hooks/useCmsContent";
import { formatDateRange } from "../../lib/dates";
import type { EducationRow } from "../../types/cms";

export function EducationSection() {
  const education = useEducation();

  return (
    <SectionShell id="education" number="05" title="Education">
      <AsyncContent
        state={education}
        isEmpty={(items) => items.length === 0}
        emptyMessage="No education has been published yet."
      >
        {(items) => (
          <ol className="timeline">
            {items.map((item) => (
              <EducationEntry key={item.id} item={item} />
            ))}
          </ol>
        )}
      </AsyncContent>
    </SectionShell>
  );
}

function EducationEntry({ item }: { item: EducationRow }) {
  const dateRange = formatDateRange(item.start_date, item.end_date, item.is_current);
  const degree = [item.degree, item.field].filter(Boolean).join(" in ");

  return (
    <li className="entry">
      <div className="entry__meta">
        {dateRange && <p className="mono-label">{dateRange}</p>}
        {item.location && <p className="entry__muted">{item.location}</p>}
      </div>
      <div className="entry__body">
        <h3 className="entry__title">{item.institution}</h3>
        {degree && <p className="entry__subtitle">{degree}</p>}
        {item.description && <p className="entry__text">{item.description}</p>}
        {item.achievements.length > 0 && (
          <ul className="bullets">
            {item.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        )}
        <TagList items={item.relevant_areas} label="Relevant areas" />
      </div>
    </li>
  );
}

