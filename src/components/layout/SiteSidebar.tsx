import { Link } from "react-router-dom";
import { useState } from "react";
import {
  useActiveSection,
  NAV_SECTION_IDS,
} from "../../hooks/useActiveSection";
import { useSiteContent } from "../../context/SiteContentContext";
import { SafeLink } from "../ui/SafeLink";
import { SECTION_LINKS } from "./navigation";

export function SiteSidebar() {
  const { profile, socialLinks } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);

  const activeId = useActiveSection(NAV_SECTION_IDS);

  const closeMenu = () => setIsOpen(false);

  const data = profile.data;

  const name = data?.full_name ?? "Portfolio";
  const title = data?.professional_title ?? "";

  const sidebarIntro =
    data?.summary
      ?.split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)[0] ?? "";

  /*
   * Contact is intentionally NOT part of the sidebar navigation.
   * The main About section will provide the primary "Get In Touch"
   * action instead, keeping the sidebar compact.
   */
  const navigationLinks = SECTION_LINKS.filter(
    (link) => link.id !== "contact"
  );

  return (
    <header className="sidebar" data-open={isOpen}>
      <div className="sidebar__bar">
        <Link to="/" className="sidebar__brand" onClick={closeMenu}>
          <span className="sidebar__name">{name}</span>

          {title && (
            <span className="sidebar__role">
              {title}
            </span>
          )}

          {sidebarIntro && (
            <span className="sidebar__intro">
              {sidebarIntro}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="sidebar__toggle"
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="sr-only">
            {isOpen ? "Close menu" : "Open menu"}
          </span>

          <span
            className="sidebar__toggle-bars"
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        className="sidebar__panel"
        id="site-navigation"
      >
        <nav
          className="sidebar__navigation"
          aria-label="Primary"
        >
          <ul className="sidebar__nav">
            {navigationLinks.map((link) => (
              <li key={link.id}>
                <Link
                  to={`/#${link.id}`}
                  className="sidebar__nav-link"
                  aria-current={
                    activeId === link.id
                      ? "true"
                      : undefined
                  }
                  onClick={closeMenu}
                >
                  <span
                    className="sidebar__nav-line"
                    aria-hidden="true"
                  />

                  <span className="sidebar__nav-label">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {socialLinks.data &&
          socialLinks.data.length > 0 && (
            <ul
              className="sidebar__socials"
              aria-label="Social links"
            >
              {socialLinks.data.map((link) => (
                <li key={link.id}>
                  <SafeLink
                    url={link.url}
                    className="sidebar__social-link"
                  >
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