import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `How to get in touch with ${SITE_NAME} for questions, bug reports, corrections or suggestions.`,
  path: "/contact",
});

export default function ContactPage() {
  const configured = !CONTACT_EMAIL.includes("PLACEHOLDER");
  return (
    <LegalPage title="Contact" path="/contact" intro="Found a bug, have an idea for a template, or spotted something wrong? Get in touch.">
      <h2>Email</h2>
      {configured ? (
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      ) : (
        <p className="rounded-[var(--radius-sm)] border border-dashed border-warn/50 bg-warn-soft px-3 py-2 text-sm">
          Contact email not configured yet — set <code>NEXT_PUBLIC_CONTACT_EMAIL</code> in your environment (see <code>.env.example</code>).
        </p>
      )}
      <h2>What&apos;s useful to include</h2>
      <ul>
        <li>For bugs: your browser and device, and what you did just before it went wrong.</li>
        <li>For chore-list corrections: which chore, and what you&apos;d change.</li>
        <li>For template ideas: the situation it&apos;s for and the chores you&apos;d include.</li>
      </ul>
      <p>Please don&apos;t send household names or personal details — the tool never needs them and neither do we.</p>
    </LegalPage>
  );
}
