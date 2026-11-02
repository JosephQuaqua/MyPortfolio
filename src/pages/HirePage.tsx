
import { Link } from "react-router-dom";
import { AsyncContent } from "../components/ui/AsyncContent";
import { HireInquiryForm } from "../components/forms/HireInquiryForm";
import { useSiteContent } from "../context/SiteContentContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function HirePage() {
  const { profile } = useSiteContent();

  useDocumentMeta({
    title: profile.data ? `Hire ${profile.data.full_name}` : "Hire",
    description:
      "Discuss a role, development opportunity, or project.",
  });

  return (
    <div className="hire-simple">
      <Link to="/" className="hire-simple__back">
        <span aria-hidden="true">←</span>
        Back to portfolio
      </Link>

      <header className="hire-simple__header">
        <p className="hire-simple__eyebrow">HIRE / WORK WITH ME</p>

        <h1 className="hire-simple__title">
          Let's work together.
        </h1>

        <p className="hire-simple__intro">
          Have a role, project, or opportunity in mind?
          Tell me a little about it using the form below.
        </p>

        <AsyncContent
          state={profile}
          isEmpty={() => false}
          emptyMessage=""
        >
          {(data) => (
            <div className="hire-simple__profile">
              {data.availability_status && (
                <p
                  className="hire-simple__availability"
                  data-available={data.is_available}
                >
                  <span
                    className="hire-simple__availability-dot"
                    aria-hidden="true"
                  />
                  {data.availability_status}
                </p>
              )}

              {data.professional_title && (
                <p className="hire-simple__role">
                  {data.professional_title}
                </p>
              )}
            </div>
          )}
        </AsyncContent>
      </header>

      <section
        className="hire-simple__form-section"
        aria-labelledby="hire-simple-form-title"
      >
        <div className="hire-simple__form-heading">
          <h2 id="hire-simple-form-title">
            Send an inquiry
          </h2>
          <p>* Required fields</p>
        </div>

        <HireInquiryForm />
      </section>

      <footer className="hire-simple__footer">
        <p>Prefer to talk first?</p>
        <Link to="/book">
          Explore consultations <span aria-hidden="true">↗</span>
        </Link>
      </footer>
    </div>
  );
}
