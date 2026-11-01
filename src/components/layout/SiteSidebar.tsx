import { useState } from "react";
import { Link } from "react-router-dom";
import { useActiveSection, NAV_SECTION_IDS } from "../../hooks/useActiveSection";
import { useSiteContent } from "../../context/SiteContentContext";
import { SafeLink } from "../ui/SafeLink";
import { CvDownloadButton } from "../ui/CvDownloadButton";
import { SECTION_LINKS } from "./navigation";

export function SiteSidebar() {
  const { profile, socialLinks } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);
  const activeId = useActiveSection(NAV_SECTION_IDS);
  const closeMenu = () => setIsOpen(false);

  const name = profile.data?.full_name ?? "";
  const title = profile.data?.professional_title;
  const primaryLabel = profile.data?.primary_cta_label;
  const primaryUrl = profile.data?.primary_cta_url;

  return (
    <header className="sidebar" data-open={isOpen}>
      <div className="sidebar__bar">
        <Link to="/" className="sidebar__brand" onClick={closeMenu}>
          <span className="sidebar__name">{name || "Portfolio"}</span>
          {title && <span className="sidebar__role">{title}</span>}
        </Link>
        <button
          type="button"
          className="sidebar__toggle"
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
          <span className="sidebar__toggle-bars" aria-hidden="true" />
        </button>
      </div>

      <div className="sidebar__panel" id="site-navigation">
        <nav aria-label="Primary">
          <ul className="sidebar__nav">
            {SECTION_LINKS.map((link) => (
              <li key={link.id}>
                <Link
                  to={`/#${link.id}`}
                  className="sidebar__nav-link"
                  aria-current={activeId === link.id ? "true" : undefined}
                  onClick={closeMenu}
                >
                  <span className="sidebar__nav-number">{link.number}.</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__actions">
          <SafeLink url={primaryUrl} className="btn btn--primary" ariaLabel={primaryLabel ?? undefined}>
            {primaryLabel ?? "Hire Me"}
          </SafeLink>
          <Link to="/book" className="btn btn--ghost" onClick={closeMenu}>
            Book a Consultation
          </Link>
          <CvDownloadButton className="btn btn--ghost" />
        </div>

        {socialLinks.data && socialLinks.data.length > 0 && (
          <ul className="sidebar__socials" aria-label="Social links">
            {socialLinks.data.map((link) => (
              <li key={link.id}>
                <SafeLink url={link.url} className="sidebar__social-link">
                  {link.label}
                </SafeLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
