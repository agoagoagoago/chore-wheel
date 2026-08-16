import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "@/config/site";

type Args = {
  title: string;
  description: string;
  /** Canonical path, e.g. "/chore-list". */
  path: string;
  /** Set for pages that must not be indexed (none by default). */
  noindex?: boolean;
  /**
   * Use the title exactly as given (no "| Site" suffix). Primary pages already
   * carry the brand words and stay under ~60 characters this way.
   */
  absoluteTitle?: boolean;
};

/** Builds consistent, unique per-page metadata with a canonical URL and OG/Twitter tags. */
export function pageMetadata({ title, description, path, noindex, absoluteTitle }: Args): Metadata {
  const url = absoluteUrl(path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  };
}
