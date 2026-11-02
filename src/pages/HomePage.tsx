import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { AboutSection } from "../components/portfolio/AboutSection";
import { CertificatesSection } from "../components/portfolio/CertificatesSection";
import { EducationSection } from "../components/portfolio/EducationSection";
import { ExperienceSection } from "../components/portfolio/ExperienceSection";
import { ProjectsSection } from "../components/portfolio/ProjectsSection";
import { SkillsSection } from "../components/portfolio/SkillsSection";

import { useSiteContent } from "../context/SiteContentContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function HomePage() {
  const { profile, settings, socialLinks } = useSiteContent();
  const location = useLocation();

  useDocumentMeta({
    title:
      settings.data?.site_title ??
      profile.data?.full_name ??
      "Portfolio",
    description: settings.data?.meta_description,
    ogTitle: settings.data?.og_title,
    ogDescription: settings.data?.og_description,
    imageUrl: settings.data?.og_image_url,
    canonicalUrl: settings.data?.canonical_url,
    faviconUrl: settings.data?.favicon_url,
  });

  useEffect(() => {
    const hash = location.hash ?? "";
    const id = hash.replace("#", "");

    if (!id) return;

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [location.key, location.hash]);

  useEffect(() => {
    const person = profile.data;

    if (!person) return;

   const sameAs = (socialLinks.data ?? [])
  .map((link) => link.url)
  .filter((url): url is string => {
    if (typeof url !== "string") {
      return false;
    }

    return /^https?:\/\//.test(url);
  });
    const script = document.createElement("script");

    script.type = "application/ld+json";

    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: person.full_name,
      jobTitle: person.professional_title ?? undefined,
      description: person.headline ?? undefined,
      address: person.location
        ? {
            "@type": "PostalAddress",
            addressLocality: person.location,
          }
        : undefined,
      sameAs,
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [profile.data, socialLinks.data]);

  return (
    <>
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <EducationSection />
      <CertificatesSection />
    </>
  );
}