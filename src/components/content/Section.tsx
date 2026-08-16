import type { ReactNode } from "react";
import { ADS_ENABLED } from "@/config/site";
import { AdSlot } from "@/components/ads/AdSlot";

/** Consistent page-width wrapper. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

/** A server-rendered content section with an anchored heading. */
export function Section({ id, title, children, className = "" }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`prose ${className}`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

/** Small "related" link list, used at the end of supporting pages. */
export function RelatedLinks({ links }: { links: { href: string; label: string; blurb: string }[] }) {
  return (
    <nav aria-label="Related tools and resources" className="mt-12 rounded-[var(--radius-md)] border border-line bg-surface p-5">
      <h2 className="text-base font-semibold">Related tools &amp; resources</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="font-medium text-accent underline underline-offset-4 hover:text-accent-strong">
              {l.label}
            </a>
            <p className="text-sm text-muted">{l.blurb}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Two-column layout with a sticky desktop sidebar ad. When ads are disabled the
 * sidebar column is not rendered at all, so no space is reserved for nothing.
 */
export function WithSidebarAd({ children, slot }: { children: ReactNode; slot: string }) {
  if (!ADS_ENABLED) return <>{children}</>;
  return (
    <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">{children}</div>
      <aside className="hidden lg:block">
        <div className="sticky top-6">
          <AdSlot slot={slot} format="vertical" />
        </div>
      </aside>
    </div>
  );
}
