import { ExperienceDetailPage } from "./pages/ExperienceDetailPage";
import { ContactPage } from "./pages/ContactPage";
import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { RequireStaff } from "./components/admin/RequireStaff";
import { HomePage } from "./pages/HomePage";
import { BookPage } from "./pages/BookPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { HirePage } from "./pages/HirePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminProjectEditPage } from "./pages/admin/AdminProjectEditPage";
import { AdminProjectsPage } from "./pages/admin/AdminProjectsPage";
import {
  availabilityBlockConfig,
  availabilityRuleConfig,
  certificationConfig,
  consultationTypeConfig,
  educationConfig,
  experienceConfig,
  skillCategoryConfig,
  skillConfig,
  socialLinkConfig,
} from "./pages/admin/cmsConfigs";
import { EntityManager } from "./components/admin/EntityManager";
import { TriageManager } from "./components/admin/TriageManager";
import { AdminActivityPage } from "./pages/admin/AdminActivityPage";
import { AdminCvPage } from "./pages/admin/AdminCvPage";
import { AdminMediaPage } from "./pages/admin/AdminMediaPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminSiteContentPage } from "./pages/admin/AdminSiteContentPage";
import { consultationsConfig, inquiriesConfig, messagesConfig } from "./pages/admin/inboxConfigs";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
      <Route path="experience/:id" element={<ExperienceDetailPage />} />

      <Route path="contact" element={<ContactPage />} />
        <Route index element={<HomePage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="hire" element={<HirePage />} />
        <Route path="book" element={<BookPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<RequireStaff />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/new" element={<AdminProjectEditPage />} />
          <Route path="projects/:id" element={<AdminProjectEditPage />} />
          <Route path="experience" element={<EntityManager config={experienceConfig} />} />
          <Route path="skills" element={<EntityManager config={skillConfig} />} />
          <Route path="skills/categories" element={<EntityManager config={skillCategoryConfig} />} />
          <Route path="education" element={<EntityManager config={educationConfig} />} />
          <Route path="certifications" element={<EntityManager config={certificationConfig} />} />
          <Route path="social-links" element={<EntityManager config={socialLinkConfig} />} />
          <Route path="consultation-types" element={<EntityManager config={consultationTypeConfig} />} />
          <Route path="availability" element={<EntityManager config={availabilityRuleConfig} />} />
          <Route path="availability/blocks" element={<EntityManager config={availabilityBlockConfig} />} />
          <Route path="consultations" element={<TriageManager config={consultationsConfig} />} />
          <Route path="inquiries" element={<TriageManager config={inquiriesConfig} />} />
          <Route path="messages" element={<TriageManager config={messagesConfig} />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="site" element={<AdminSiteContentPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="cv" element={<AdminCvPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
