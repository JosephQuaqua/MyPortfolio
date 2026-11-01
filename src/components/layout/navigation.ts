export interface SectionLink {
  id: string;
  number: string;
  label: string;
}

export const SECTION_LINKS: SectionLink[] = [
  { id: "about", number: "01", label: "About" },
  { id: "experience", number: "02", label: "Experience" },
  { id: "projects", number: "03", label: "Projects" },
  { id: "skills", number: "04", label: "Skills" },
  { id: "education", number: "05", label: "Education" },
  { id: "certificates", number: "06", label: "Certificates" },
  { id: "contact", number: "07", label: "Contact" },
];
