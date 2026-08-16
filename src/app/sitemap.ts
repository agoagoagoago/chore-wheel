import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

/**
 * Only canonical, indexable pages. Share/template state lives in URL hashes
 * and never appears here.
 */
export const INDEXABLE_PATHS = [
  "/",
  "/chore-wheel-for-kids",
  "/family-chore-wheel",
  "/roommate-chore-wheel",
  "/chore-list",
  "/weekly-chore-chart",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const primary = new Set([
    "/",
    "/chore-wheel-for-kids",
    "/family-chore-wheel",
    "/roommate-chore-wheel",
    "/chore-list",
    "/weekly-chore-chart",
  ]);
  return INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: primary.has(path) ? "monthly" : "yearly",
    priority: path === "/" ? 1 : primary.has(path) ? 0.8 : 0.3,
  }));
}
