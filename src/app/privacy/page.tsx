import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data: everything you enter stays in your browser; what changes if analytics or advertising are enabled.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy" intro="Short version: what you type stays on your device.">
      <p className="text-sm text-muted">
        Last updated: <span>OWNER_TO_SET_DATE</span>.{" "}
        {/* OWNER: replace with the real date and review the wording with your own legal advice. */}
      </p>

      <h2>Data you enter</h2>
      <p>
        Chores, people&apos;s names, saved wheels, spin history, assignment history and the weekly chart are stored in your browser using
        local storage. They are not transmitted to {SITE_NAME}&apos;s servers and we cannot see them. Clearing your browser&apos;s site data
        deletes them; there is nothing for us to delete on our side.
      </p>

      <h2>Share links</h2>
      <p>
        When you create a share link, the wheel&apos;s contents are encoded into the fragment of the URL (the part after <code>#</code>).
        Browsers do not send the fragment to web servers, so opening a shared link does not upload the wheel. Anyone who has the link can
        decode it, so treat it like any other link you share.
      </p>

      <h2>Server logs and hosting</h2>
      <p>
        Like any website, requests for pages and assets are handled by our hosting provider, which may keep standard access logs (IP
        address, user agent, requested URL, timestamp) for security and operations.{" "}
        {/* OWNER: name the hosting provider and its retention if required in your jurisdiction. */}
      </p>

      <h2>Analytics</h2>
      <p>
        Analytics is disabled by default. If it is enabled in future, it will record anonymous usage events such as &ldquo;wheel spun&rdquo;
        or &ldquo;template selected&rdquo; with counts only — never the chores or names you enter. This page will be updated to name the
        provider and explain any opt-out before that happens.
      </p>

      <h2>Advertising</h2>
      <p>
        {SITE_NAME} may in future display advertising (for example, Google AdSense) to cover hosting costs. Advertising partners may use
        cookies or similar technologies to serve and measure ads; where required by law, you will be asked for consent before any
        personalised advertising is shown, and you can change your choice at any time. See the <Link href="/cookies">cookie policy</Link>.
        Ads are never placed where they could be mistaken for part of the tool.
      </p>

      <h2>Children</h2>
      <p>
        The kids&apos; chore wheel is meant to be used by parents and carers with children. We do not knowingly collect personal information
        from children — or from anyone, since nothing entered into the tool leaves the device.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: see the <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
