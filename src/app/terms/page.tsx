import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use for the Chore Wheel Tool",
  absoluteTitle: true,
  description: `The terms under which ${SITE_NAME} is provided: free to use, no warranty, and common-sense rules for the chore suggestions.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" path="/terms">
      <p className="text-sm text-muted">
        Last updated: <time dateTime="2026-08-16">16 August 2026</time>.
      </p>
      <h2>Use of the tool</h2>
      <p>
        {SITE_NAME} is provided free of charge for personal, household, classroom and small-group use. You may use it, save wheels, and
        share links freely. You may not attempt to disrupt the service, scrape it at scale, or misrepresent it as your own.
      </p>
      <h2>No warranty</h2>
      <p>
        The tool is provided &ldquo;as is&rdquo;. We work hard to keep it accurate and available, but make no guarantee that it will be
        error-free, uninterrupted, or that random selection or Fair Rotation will produce any particular distribution. Local storage can be
        cleared by your browser; keep a copy (a saved link or a printout) of anything you would hate to lose.
      </p>
      <h2>Chore suggestions and safety</h2>
      <p>
        Chore lists, templates and age groupings are general suggestions. You are responsible for deciding which chores are appropriate and
        safe for the people in your household — in particular for children — and for supervising as needed. Nothing here is professional,
        medical or legal advice.
      </p>
      <h2>Content and intellectual property</h2>
      <p>
        The design, code and written content of {SITE_NAME} are protected by copyright. Chore names are ordinary language and you are
        welcome to use them however you like. Anything you type into the tool remains yours and stays on your device.
      </p>
      <h2>Changes</h2>
      <p>These terms may be updated from time to time; the date above shows the current version.</p>
      <h2>Contact</h2>
      <p>
        Questions: see the <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
