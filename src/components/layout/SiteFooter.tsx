import { useSiteContent } from "../../context/SiteContentContext";

export function SiteFooter() {
  const { settings } = useSiteContent();
  const text = settings.data?.footer_text;
  if (!text) return null;
  return (
    <footer className="site-footer">
      <p className="mono-label">
        © {new Date().getFullYear()} {text}
      </p>
    </footer>
  );
}
