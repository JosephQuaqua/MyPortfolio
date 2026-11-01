import { useSiteContent } from "../../context/SiteContentContext";
import { SectionShell } from "../ui/SectionShell";
import { SafeLink } from "../ui/SafeLink";
import { Link } from "react-router-dom";
import { ContactForm } from "../forms/ContactForm";
import { toSafeHref } from "../../lib/links";

export function ContactSection() {
  const { socialLinks, profile } = useSiteContent();
  const email = socialLinks.data?.find((link) => link.platform === "email");
  const phone = socialLinks.data?.find((link) => link.platform === "phone");
  const otherLinks = socialLinks.data?.filter((link) => link.platform !== "email" && link.platform !== "phone") ?? [];
  const hireHref = toSafeHref(profile.data?.primary_cta_url);

  return (
    <SectionShell id="contact" number="07" title="Contact">
      <div className="contact">
        <div className="contact__details">
          <p className="entry__text">
            For a role, a freelance project or a technical conversation, send a message or use the Hire Me form.
          </p>
          {profile.data?.location && <p className="entry__muted">{profile.data.location}</p>}
          <dl className="contact__list">
            {email?.url && (
              <>
                <dt className="mono-label">Email</dt>
                <dd>
                  <SafeLink url={email.url} className="text-link">
                    {email.url.replace(/^mailto:/, "")}
                  </SafeLink>
                </dd>
              </>
            )}
            {phone?.url && (
              <>
                <dt className="mono-label">Phone</dt>
                <dd>
                  <SafeLink url={phone.url} className="text-link">
                    {phone.url.replace(/^tel:/, "")}
                  </SafeLink>
                </dd>
              </>
            )}
          </dl>
          {otherLinks.length > 0 && (
            <ul className="contact__socials" aria-label="Social links">
              {otherLinks.map((link) => (
                <li key={link.id}>
                  <SafeLink url={link.url} className="text-link">
                    {link.label}
                  </SafeLink>
                </li>
              ))}
            </ul>
          )}
          {hireHref && (
            <SafeLink url={hireHref} className="btn btn--primary">
              {profile.data?.primary_cta_label ?? "Hire Me"}
            </SafeLink>
          )}
          <Link to="/book" className="btn btn--ghost">
            Book a Consultation
          </Link>
        </div>
        <ContactForm />
      </div>
    </SectionShell>
  );
}
