import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../pages/admin/admin.css";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/projects", label: "Projects", end: false },
  { to: "/admin/experience", label: "Experience", end: false },
  { to: "/admin/skills", label: "Skills", end: false },
  { to: "/admin/education", label: "Education", end: false },
  { to: "/admin/certifications", label: "Certifications", end: false },
  { to: "/admin/social-links", label: "Social Links", end: false },
  { to: "/admin/consultation-types", label: "Consultation Types", end: false },
  { to: "/admin/availability", label: "Availability", end: false },
  { to: "/admin/consultations", label: "Consultations", end: false },
  { to: "/admin/inquiries", label: "Hiring Inquiries", end: false },
  { to: "/admin/messages", label: "Messages", end: false },
  { to: "/admin/media", label: "Media", end: false },
  { to: "/admin/site", label: "Site Content", end: false },
  { to: "/admin/cv", label: "CV", end: false },
  { to: "/admin/settings", label: "Settings", end: false },
  { to: "/admin/activity", label: "Activity", end: false },
];

export function AdminLayout() {
  const { state, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const email = state.status === "staff" ? state.email : null;

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__brand">Portfolio CMS</p>
        <nav className="admin-nav" aria-label="Admin sections">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          {email && <p className="admin-sidebar__email">{email}</p>}
          <button type="button" className="btn btn--ghost btn--block" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main" id="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
