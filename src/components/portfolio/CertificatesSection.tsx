import { Link } from "react-router-dom";
import { AsyncContent } from "../ui/AsyncContent";
import { SectionShell } from "../ui/SectionShell";
import { CertificationEntry } from "./CertificationEntry";
import { useCertifications } from "../../hooks/useCmsContent";

export function CertificatesSection() {
  const certifications = useCertifications();

  return (
    <SectionShell id="certificates" number="06" title="Certificates">
      <AsyncContent
        state={certifications}
        isEmpty={(items) => items.length === 0}
        emptyMessage="No certificates have been published yet."
      >
        {(items) => (
          <ul className="cert-list">
            {items.map((item) => (
              <CertificationEntry key={item.id} item={item} />
            ))}
          </ul>
        )}
      </AsyncContent>
      <Link to="/certificates" className="text-link">
        Open the full certificates page
      </Link>
    </SectionShell>
  );
}
