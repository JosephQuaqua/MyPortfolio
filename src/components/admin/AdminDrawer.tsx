import { useEffect, useId, type ReactNode } from "react";

interface AdminDrawerProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function AdminDrawer({ title, onClose, children }: AdminDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="admin-drawer__header">
          <h2 id={titleId} className="admin-drawer__title">
            {title}
          </h2>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="admin-drawer__body">{children}</div>
      </aside>
    </div>
  );
}
