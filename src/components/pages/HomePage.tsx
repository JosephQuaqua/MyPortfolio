import { AboutSection } from "../portfolio/AboutSection";
import { ExperienceSection } from "../portfolio/ExperienceSection";
import { ProjectsSection } from "../portfolio/ProjectsSection";
import { SkillsSection } from "../portfolio/SkillsSection";
import { EducationSection } from "../portfolio/EducationSection";
import { CertificatesSection } from "../portfolio/CertificatesSection";

export function HomePage() {
  return (
    <>
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <EducationSection />
      <CertificatesSection />
    </>
  );
}