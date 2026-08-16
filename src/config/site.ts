/**
 * Central site configuration.
 *
 * Every owner-specific value lives here and is read from NEXT_PUBLIC_* env vars
 * (see .env.example). Placeholders are intentionally obvious so nothing fake
 * ships by accident.
 */

const env = (key: string, fallback: string) => (typeof process !== "undefined" && process.env[key]) || fallback;

export const SITE_NAME = env("NEXT_PUBLIC_SITE_NAME", "Chore Wheel");

/** Absolute origin without trailing slash. Used for canonicals, OG, sitemap. */
export const SITE_URL = env("NEXT_PUBLIC_SITE_URL", "https://example.com").replace(/\/$/, "");

export const CONTACT_EMAIL = env("NEXT_PUBLIC_CONTACT_EMAIL", "CONTACT_EMAIL_PLACEHOLDER");

/** Google AdSense publisher id, e.g. "pub-1234567890123456". Empty = ads disabled. */
export const ADSENSE_PUBLISHER_ID = env("NEXT_PUBLIC_ADSENSE_PUBLISHER_ID", "");

/** Show reserved ad placeholders (dev/staging) even without a publisher id. */
export const ADS_PLACEHOLDERS = env("NEXT_PUBLIC_ADS_PLACEHOLDERS", "false") === "true";

/** GA4 measurement id, e.g. "G-XXXXXXXXXX". Empty = analytics disabled. */
export const GA_MEASUREMENT_ID = env("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");

export const ADS_ENABLED = ADSENSE_PUBLISHER_ID.length > 0 || ADS_PLACEHOLDERS;
export const ANALYTICS_ENABLED = GA_MEASUREMENT_ID.length > 0;

export const SITE_DESCRIPTION =
  "A free chore wheel you can use right now: add household chores, spin to pick one at random, or assign chores to people fairly. Save, share and print — no account needed.";

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Limits communicated to users. */
export const LIMITS = {
  maxChores: 100,
  maxPeople: 20,
  maxNameLength: 60,
  maxHistory: 50,
  maxSavedWheels: 30,
  maxSharePayloadBytes: 6000,
} as const;
