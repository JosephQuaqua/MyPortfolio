import { SafeLink } from "../ui/SafeLink";
import { AsyncContent } from "../ui/AsyncContent";
import { useExperiences } from "../../hooks/useCmsContent";
import { SectionShell } from "../ui/SectionShell";
import { TagList } from "../ui/TagList";
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
          <ol className="timeline">
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
  const dateRange = formatDateRange(item.start_date, item.end_date, item.is_current);
  const subtitle = [item.role, item.organization].filter(Boolean).join(" · ");

  return (
    <li className="entry">
      <div className="entry__meta">
        <p className="mono-label">{item.experience_type}</p>
        {dateRange && <p className="mono-label entry__muted">{dateRange}</p>}
        {item.location && <p className="entry__muted">{item.location}</p>}
      </div>
      <div className="entry__body">
        <h3 className="entry__title">{item.title}</h3>
        {subtitle && <p className="entry__subtitle">{subtitle}</p>}
        {item.description && <p className="entry__text">{item.description}</p>}
        {item.achievements.length > 0 && (
          <ul className="bullets">
            {item.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        )}
        <TagList items={item.technologies} label="Technologies" />
        {(item.live_url || item.github_url) && (
          <div className="entry__links">
            <SafeLink url={item.live_url} className="text-link">
              Live site
            </SafeLink>
            <SafeLink url={item.github_url} className="text-link">
              GitHub
            </SafeLink>
          </div>
        )}
      </div>
    </li>
  );
}
