import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 * - 'unsafe-inline' for scripts is required by Next.js's inline hydration
 *   payload on statically prerendered pages (nonces need per-request rendering).
 * - Fathom Analytics loads from and reports to cdn.usefathom.com.
 * - GA (if ever enabled) and AdSense hosts are added only when configured.
 *   AdSense will need many more hosts (googlesyndication, doubleclick, …) —
 *   extend this list at that time and re-test.
 */
const analyticsHosts = ["https://cdn.usefathom.com"];
if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  analyticsHosts.push("https://www.googletagmanager.com", "https://*.google-analytics.com", "https://*.analytics.google.com");
}
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${analyticsHosts.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${analyticsHosts.join(" ")}`, // Fathom/GA beacons are image pixels
  "font-src 'self' data:",
  `connect-src 'self' ${analyticsHosts.join(" ")}`,
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: __dirname },
  poweredByHeader: false,
  async redirects() {
    return [
      // The whole site is the chore wheel, so the tool lives at "/".
      // Keep the descriptive URL working without creating a duplicate page.
      { source: "/chore-wheel", destination: "/", permanent: true },
      { source: "/wheel-of-chores", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
