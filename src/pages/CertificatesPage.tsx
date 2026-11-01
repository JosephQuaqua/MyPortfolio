import { Link } from "react-router-dom";
import { AsyncContent } from "../components/ui/AsyncContent";
import { CertificationEntry } from "../components/portfolio/CertificationEntry";
import { useCertifications } from "../hooks/useCmsContent";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useSiteContent } from "../context/SiteContentContext";

export function CertificatesPage() {
  const certifications = useCertifications();
  const { profile } = useSiteContent();

  useDocumentMeta({
    title: profile.data ? `Certificates | ${profile.data.full_name}` : "Certificates",
    description: "Certificates and credentials earned.",
  });

  return (
    <div className="page-narrow">
      <Link to="/" className="back-link">
        Back to portfolio
      </Link>
      <p className="mono-label">Credentials</p>
      <h1 className="page-title">Certificates</h1>
      <AsyncContent
        state={certifications}
        isEmpty={(items) => items.length === 0}
        emptyMessage="No certificates have been published yet."
      >
        {(items) => (
          <ul className="cert-list cert-list--single">
            {items.map((item) => (
              <CertificationEntry key={item.id} item={item} />
            ))}
          </ul>
        )}
      </AsyncContent>
    </div>
  );
}
