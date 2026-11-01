import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function NotFoundPage() {
  useDocumentMeta({ title: "Page not found" });
  return (
    <div className="page-narrow">
      <p className="mono-label">404</p>
      <h1 className="page-title">This page does not exist.</h1>
      <Link to="/" className="btn btn--ghost">
        Back to portfolio
      </Link>
    </div>
  );
}
