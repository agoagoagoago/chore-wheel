import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: `Which cookies and browser storage ${SITE_NAME} uses today (local storage for your wheel; no tracking cookies) and what changes if ads or analytics are enabled.`,
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" path="/cookies">
      <p className="text-sm text-muted">
        Last updated: <span>OWNER_TO_SET_DATE</span>. {/* OWNER: replace with the real date. */}
      </p>
      <h2>What we use today</h2>
      <ul>
        <li>
          <strong>Local storage (not a cookie):</strong> keys beginning with <code>chorewheel:</code> hold your wheel, saved wheels, history
          and weekly chart. They never leave your browser and are essential to the tool working. Clear them via your browser&apos;s
          site-data settings or the tool&apos;s own <em>Clear</em> buttons.
        </li>
        <li>
          <strong>No tracking cookies</strong> are set by {SITE_NAME} itself.
        </li>
      </ul>
      <h2>If analytics is enabled</h2>
      <p>
        An analytics provider (such as Google Analytics) would set its own cookies or identifiers to count visits and events. This page and
        the <Link href="/privacy">privacy policy</Link> will be updated to name the provider before that happens.
      </p>
      <h2>If advertising is enabled</h2>
      <p>
        Advertising partners such as Google AdSense use cookies and similar technologies to serve and measure ads. In regions where consent
        is required (for example under GDPR / the ePrivacy rules in the EU/UK), a consent banner will be shown before any non-essential
        cookies are set, and you will be able to withdraw consent at any time.{" "}
        {/* OWNER: link your consent-management tool here once configured. */}
      </p>
      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies and site data in their settings. Blocking local storage will stop the wheel from
        remembering your chores between visits.
      </p>
    </LegalPage>
  );
}
