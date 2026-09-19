import type { Metadata } from "next";
import { siteConfig } from "./data";

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

/** Per-page metadata: unique title + description, canonical URL, and social
 *  tags. Child pages replace (not merge) the layout's openGraph object, so each
 *  page has to supply its own. */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const full = `${title} | ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: full,
      description,
      url: path,
    },
    twitter: { card: "summary", title: full, description },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}
