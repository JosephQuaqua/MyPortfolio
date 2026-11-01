import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  imageUrl?: string | null;
  canonicalUrl?: string | null;
  faviconUrl?: string | null;
}

function setMetaTag(attribute: "name" | "property", key: string, content: string | null | undefined) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string | null | undefined) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function useDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  imageUrl,
  canonicalUrl,
  faviconUrl,
}: DocumentMeta) {
  useEffect(() => {
    document.title = title;
    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", ogTitle ?? title);
    setMetaTag("property", "og:description", ogDescription ?? description);
    setMetaTag("property", "og:image", imageUrl);
    setLinkTag("canonical", canonicalUrl);
    setLinkTag("icon", faviconUrl);
  }, [title, description, ogTitle, ogDescription, imageUrl, canonicalUrl, faviconUrl]);
}
