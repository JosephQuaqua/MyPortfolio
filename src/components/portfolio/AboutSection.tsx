import { Link } from "react-router-dom";
import { useSiteContent } from "../../context/SiteContentContext";
import { AsyncContent } from "../ui/AsyncContent";
import { SafeLink } from "../ui/SafeLink";
import { CvDownloadButton } from "../ui/CvDownloadButton";
import { toSafeHref } from "../../lib/links";

export function AboutSection() {
  const { profile, socialLinks } = useSiteContent();
  const paragraphs = (profile.data?.summary ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hireHref = toSafeHref(profile.data?.primary_cta_url);

  return (
    <section id="about" className="hero" aria-labelledby="hero-heading">
      <AsyncContent state={profile} isEmpty={() => false} emptyMessage="Profile content is not available yet.">
        {(data) => (
          <div className="hero__grid">
            <div className="hero__text">
              <p className="mono-label">01 · About</p>
              {data.headline && <p className="hero__headline">{data.headline}</p>}
              <h1 id="hero-heading" className="hero__name">
                {data.full_name}
              </h1>
              {data.professional_title && <p className="hero__title">{data.professional_title}</p>}

              {data.availability_status && (
                <p className="availability" data-available={data.is_available}>
                  <span className="availability__dot" aria-hidden="true" />
                  {data.availability_status}
                </p>
              )}

              {paragraphs.length > 0 && (
                <div className="hero__summary">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              )}

              <div className="hero__actions">
                <Link to="/#projects" className="btn btn--ghost">
                  View Projects
                </Link>
                {hireHref && (
                  <SafeLink url={hireHref} className="btn btn--primary">
                    {data.primary_cta_label ?? "Hire Me"}
                  </SafeLink>
                )}
                <CvDownloadButton className="btn btn--ghost" />
                <SafeLink url={data.secondary_cta_url} className="btn btn--ghost">
                  {data.secondary_cta_label ?? "Book a Consultation"}
                </SafeLink>
              </div>

              {socialLinks.data && socialLinks.data.length > 0 && (
                <ul className="hero__socials" aria-label="Social links">
                  {socialLinks.data.map((link) => (
                    <li key={link.id}>
                      <SafeLink url={link.url} className="text-link">
                        {link.label}
                      </SafeLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {data.profile_image_url && (
              <figure className="hero__media">
                <img src={data.profile_image_url} alt={data.full_name} loading="eager" />
              </figure>
            )}
          </div>
        )}
      </AsyncContent>
    </section>
  );
}
