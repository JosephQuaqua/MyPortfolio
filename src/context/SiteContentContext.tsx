import { createContext, useContext, type ReactNode } from "react";
import { useAsyncData, type AsyncData } from "../hooks/useAsyncData";
import { fetchCvUrl } from "../services/cvFile";
import { fetchProfile, fetchSiteSettings, fetchSocialLinks } from "../services/siteContent";
import type { ProfileRow, SiteSettingsRow, SocialLinkRow } from "../types/cms";

interface SiteContentValue {
  profile: AsyncData<ProfileRow | null>;
  settings: AsyncData<SiteSettingsRow | null>;
  socialLinks: AsyncData<SocialLinkRow[]>;
  cvUrl: AsyncData<string | null>;
}

const SiteContentContext = createContext<SiteContentValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const profile = useAsyncData(fetchProfile);
  const settings = useAsyncData(fetchSiteSettings);
  const socialLinks = useAsyncData(fetchSocialLinks);
  const cvUrl = useAsyncData(fetchCvUrl);

  return (
    <SiteContentContext.Provider value={{ profile, settings, socialLinks, cvUrl }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentValue {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error("useSiteContent must be used inside SiteContentProvider.");
  return value;
}
