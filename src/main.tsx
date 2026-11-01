import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <SiteContentProvider>
          <App />
        </SiteContentProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
