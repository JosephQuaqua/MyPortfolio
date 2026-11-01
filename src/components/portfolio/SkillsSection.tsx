import { AsyncContent } from "../ui/AsyncContent";
import { SectionShell } from "../ui/SectionShell";
import { useSkillGroups } from "../../hooks/useCmsContent";

export function SkillsSection() {
  const skillGroups = useSkillGroups();
  return (
    <SectionShell id="skills" number="04" title="Skills">
      <AsyncContent
        state={skillGroups}
        isEmpty={(groups) => groups.length === 0}
        emptyMessage="No skills have been published yet."
      >
        {(groups) => (
          <div className="skill-groups">
            {groups.map((group) => (
              <div key={group.id} className="skill-group">
                <h3 className="subheading">{group.name}</h3>
                <ul className="chip-list">
                  {group.skills.map((skill) => (
                    <li key={skill.id} className="chip" data-featured={skill.is_featured}>
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </AsyncContent>
    </SectionShell>
  );
}
