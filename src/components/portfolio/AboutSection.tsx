import { Link } from "react-router-dom";
import { useSiteContent } from "../../context/SiteContentContext";
import { AsyncContent } from "../ui/AsyncContent";

export function AboutSection() {
  const { profile } = useSiteContent();

  return (
    <section
      id="about"
      className="about-section"
      aria-label="About"
    >
      <AsyncContent
        state={profile}
        isEmpty={() => false}
        emptyMessage="Profile content is not available yet."
      >
        {(data) => {
          const paragraphs = (data.summary ?? "")
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);

          return (
            <div className="about-section__inner">
              <div className="about-copy">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 20)}`}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="about-contact">
                <Link
                  to="/contact"
                  className="about-contact__link"
                >
                  <span>Get In Touch</span>

                  <span
                    className="about-contact__arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          );
        }}
      </AsyncContent>
    </section>
  );
}