import { Outlet } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { SiteSidebar } from "./SiteSidebar";

export function SiteLayout() {
  return (
    <div className="app-shell">
      <SiteSidebar />
      <main id="main" className="content">
        <Outlet />
        <SiteFooter />
      </main>
    </div>
  );
}
