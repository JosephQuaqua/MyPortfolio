import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { isExternalHref, toSafeHref } from "../../lib/links";

interface SafeLinkProps {
  url: string | null | undefined;
  className?: string;
  children: ReactNode;
  download?: boolean;
  ariaLabel?: string;
}

export function SafeLink({ url, className, children, download, ariaLabel }: SafeLinkProps) {
  const href = toSafeHref(url);
  if (!href) return null;

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link to={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const external = isExternalHref(href);
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      download={download ? true : undefined}
      target={external && !href.startsWith("mailto:") && !href.startsWith("tel:") ? "_blank" : undefined}
      rel={external && !href.startsWith("mailto:") && !href.startsWith("tel:") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
