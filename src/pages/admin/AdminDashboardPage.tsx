import { Link } from "react-router-dom";
import { AsyncContent } from "../../components/ui/AsyncContent";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchAdminProjects } from "../../services/adminProjects";
import { listActivity, type ActivityRecord } from "../../services/activity";
import { countRows } from "../../services/cmsTable";
import { formatDateTime } from "./cmsConfigs";

interface DashboardData {
  projects: { total: number; published: number; drafts: number; featured: number };
  counts: { label: string; value: number; to: string }[];
  activity: ActivityRecord[];
}

const COUNT_ERROR = "Dashboard counts could not be loaded.";

async function loadDashboard(): Promise<DashboardData> {
  const nowIso = new Date().toISOString();
  const [projects, activity, experiences, skills, certifications, unread, newInquiries, pendingBookings, confirmedUpcoming] = await Promise.all([
    fetchAdminProjects(),
    listActivity(8),
    countRows("experiences", {}, COUNT_ERROR),
    countRows("skills", {}, COUNT_ERROR),
    countRows("certifications", {}, COUNT_ERROR),
    countRows("contact_messages", { eq: { status: "unread" } }, COUNT_ERROR),
    countRows("hiring_inquiries", { eq: { status: "new" } }, COUNT_ERROR),
    countRows("consultations", { eq: { status: "pending" } }, COUNT_ERROR),
    countRows("consultations", { eq: { status: "confirmed" }, gte: { column: "starts_at", value: nowIso } }, COUNT_ERROR),
  ]);

  return {
    projects: {
      total: projects.length,
      published: projects.filter((item) => item.publication_status === "published").length,
      drafts: projects.filter((item) => item.publication_status === "draft").length,
      featured: projects.filter((item) => item.is_featured).length,
    },
    counts: [
      { label: "Unread messages", value: unread, to: "/admin/messages" },
      { label: "New hiring inquiries", value: newInquiries, to: "/admin/inquiries" },
      { label: "Pending bookings", value: pendingBookings, to: "/admin/consultations" },
      { label: "Confirmed upcoming bookings", value: confirmedUpcoming, to: "/admin/consultations" },
      { label: "Experience entries", value: experiences, to: "/admin/experience" },
      { label: "Skills", value: skills, to: "/admin/skills" },
      { label: "Certificates", value: certifications, to: "/admin/certifications" },
    ],
    activity,
  };
}

const QUICK_ACTIONS = [
  { label: "New project", to: "/admin/projects/new" },
  { label: "Add experience", to: "/admin/experience" },
  { label: "Upload CV", to: "/admin/cv" },
  { label: "Review messages", to: "/admin/messages" },
  { label: "Set availability", to: "/admin/availability" },
];

export function AdminDashboardPage() {
  const dashboard = useAsyncData(loadDashboard);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="mono-label">Overview</p>
          <h1 className="admin-page__title">Dashboard</h1>
        </div>
      </header>

      <div className="admin-quick-actions" aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.to + action.label} to={action.to} className="btn btn--ghost">
            {action.label}
          </Link>
        ))}
      </div>

      <AsyncContent state={dashboard} isEmpty={() => false} emptyMessage="Your dashboard could not load any data yet.">
        {(data) => (
          <>
            <h2 className="admin-section-title">Projects</h2>
            <div className="admin-stats">
              <Link to="/admin/projects" className="admin-stat">
                <span className="admin-stat__value">{data.projects.total}</span>
                <span className="admin-stat__label">Projects</span>
              </Link>
              <Link to="/admin/projects" className="admin-stat">
                <span className="admin-stat__value">{data.projects.published}</span>
                <span className="admin-stat__label">Published projects</span>
              </Link>
              <Link to="/admin/projects" className="admin-stat">
                <span className="admin-stat__value">{data.projects.drafts}</span>
                <span className="admin-stat__label">Draft projects</span>
              </Link>
              <Link to="/admin/projects" className="admin-stat">
                <span className="admin-stat__value">{data.projects.featured}</span>
                <span className="admin-stat__label">Featured projects</span>
              </Link>
            </div>

            <h2 className="admin-section-title">Inbox and content</h2>
            <div className="admin-stats">
              {data.counts.map((item) => (
                <Link key={item.label} to={item.to} className="admin-stat">
                  <span className="admin-stat__value">{item.value}</span>
                  <span className="admin-stat__label">{item.label}</span>
                </Link>
              ))}
            </div>

            <h2 className="admin-section-title">Recent activity</h2>
            {data.activity.length === 0 ? (
              <p className="admin-page__description">No changes have been recorded yet.</p>
            ) : (
              <ul className="admin-activity-list">
                {data.activity.map((entry) => (
                  <li key={entry.id} className="admin-activity-list__item">
                    <span className="admin-activity-list__action">{entry.action}</span>
                    <span className="admin-activity-list__meta">
                      {entry.entity} {entry.actor_email ? `by ${entry.actor_email}` : ""} · {formatDateTime(entry.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/activity" className="text-link">
              View full activity log
            </Link>
          </>
        )}
      </AsyncContent>
    </section>
  );
}
