import { Link } from "react-router-dom";
import { AsyncContent } from "../components/ui/AsyncContent";
import { HireInquiryForm } from "../components/forms/HireInquiryForm";
import { useSiteContent } from "../context/SiteContentContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function HirePage() {
  const { profile } = useSiteContent();

  useDocumentMeta({
    title: profile.data ? `Hire ${profile.data.full_name}` : "Hire",
    description: profile.data?.availability_status,
  });

  return (
    <div className="page-narrow">
      <Link to="/" className="back-link">
        Back to portfolio
      </Link>
      <p className="mono-label">Hire Me</p>
      <h1 className="page-title">Start a hiring inquiry</h1>
      <AsyncContent state={profile} isEmpty={() => false} emptyMessage="Profile content is not available yet.">
        {(data) => (
          <>
            {data.availability_status && (
              <p className="availability" data-available={data.is_available}>
                <span className="availability__dot" aria-hidden="true" />
                {data.availability_status}
              </p>
            )}
            {data.professional_title && <p className="entry__text">{data.professional_title}</p>}
          </>
        )}
      </AsyncContent>
      <p className="entry__text">
        Share the details of the role or project. Only name, email and opportunity type are required.
      </p>
      <HireInquiryForm />
    </div>
  );
}
