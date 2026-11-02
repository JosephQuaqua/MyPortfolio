
import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import { SafeLink } from "../components/ui/SafeLink";
import { ContactForm } from "../components/forms/ContactForm";
import { toSafeHref } from "../lib/links";

export function ContactPage() {
  const { socialLinks, profile } = useSiteContent();

  const links = socialLinks.data ?? [];

  const email = links.find(
    (link) => link.platform === "email"
  );

  const phone = links.find(
    (link) => link.platform === "phone"
  );

  const otherLinks = links.filter(
    (link) =>
      link.platform !== "email" &&
      link.platform !== "phone"
  );

  const hireHref = toSafeHref(
    profile.data?.primary_cta_url
  );

  return (
    <div className="contact-page">
      <Link to="/" className="contact-page__back">
        <span aria-hidden="true">←</span>
        <span>Back to portfolio</span>
      </Link>

      <header className="contact-page__intro">
        <p className="contact-page__eyebrow">
          Get In Touch
        </p>

        <h1 className="contact-page__title">
          Let’s work together.
        </h1>

        <p className="contact-page__lead">
          Whether you have a project in mind, a role you would
          like to discuss, or simply want to start a technical
          conversation, I’d be happy to hear from you.
        </p>
      </header>

      <div className="contact-page__layout">
        <aside className="contact-page__sidebar">
          <div className="contact-page__block">
            <p className="contact-page__label">
              Contact
            </p>

            <dl className="contact-page__details">
              {email?.url && (
                <div className="contact-page__detail">
                  <dt>Email</dt>
                  <dd>
                    <SafeLink
                      url={email.url}
                      className="contact-page__link"
                    >
                      {email.url.replace(/^mailto:/, "")}
                    </SafeLink>
                  </dd>
                </div>
              )}

              {phone?.url && (
                <div className="contact-page__detail">
                  <dt>Phone</dt>
                  <dd>
                    <SafeLink
                      url={phone.url}
                      className="contact-page__link"
                    >
                      {phone.url.replace(/^tel:/, "")}
                    </SafeLink>
                  </dd>
                </div>
              )}

              {profile.data?.location && (
                <div className="contact-page__detail">
                  <dt>Based in</dt>
                  <dd>{profile.data.location}</dd>
                </div>
              )}
            </dl>
          </div>

          {otherLinks.length > 0 && (
            <div className="contact-page__block">
              <p className="contact-page__label">
                Elsewhere
              </p>

              <ul
                className="contact-page__socials"
                aria-label="Social links"
              >
                {otherLinks.map((link) => (
                  <li key={link.id}>
                    <SafeLink
                      url={link.url}
                      className="contact-page__link"
                    >
                      {link.label}
                    </SafeLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="contact-page__actions">
            {hireHref && (
              <SafeLink
                url={hireHref}
                className="contact-page__action contact-page__action--primary"
              >
                <span>
                  {profile.data?.primary_cta_label ??
                    "Hire Me"}
                </span>
                <span aria-hidden="true">↗</span>
              </SafeLink>
            )}

            <Link
              to="/book"
              className="contact-page__action"
            >
              <span>Book a Consultation</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </aside>

        <section
          className="contact-page__form"
          aria-label="Contact form"
        >
          <div className="contact-page__form-header">
            <p className="contact-page__label">
              Send a Message
            </p>
            <p>
              Tell me a little about what you’re working on
              and how I can help.
            </p>
          </div>

          <ContactForm />
        </section>
      </div>
    </div>
  );
}
