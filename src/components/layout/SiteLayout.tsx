import { Outlet } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { SiteSidebar } from "./SiteSidebar";
import { CursorGlow } from "../ui/CursorGlow";

export function SiteLayout() {
  return (
    <div className="app-shell">
      <CursorGlow />
      <SiteSidebar />

      <main id="main" className="content">
        <Outlet />
        <SiteFooter />
      </main>
    </div>
  );
}