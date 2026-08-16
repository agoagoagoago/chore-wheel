import Link from "next/link";
import { SITE_NAME } from "@/config/site";

const NAV = [
  { href: "/", label: "Chore Wheel" },
  { href: "/chore-list", label: "Chore List" },
  { href: "/chore-wheel-for-kids", label: "Kids" },
  { href: "/family-chore-wheel", label: "Families" },
  { href: "/roommate-chore-wheel", label: "Roommates" },
  { href: "/weekly-chore-chart", label: "Weekly Chart" },
];

/**
 * Server-rendered header. The mobile menu is a <details> element so it works
 * without JavaScript and needs no client bundle.
 */
export function Header() {
  return (
    <header className="border-b border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Logo />
          <span>{SITE_NAME}</span>
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] px-3 text-[0.95rem] font-medium text-muted hover:bg-surface-2 hover:text-ink"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <details className="relative md:hidden">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Primary"
            className="absolute right-0 z-20 mt-2 w-56 rounded-[var(--radius-md)] border border-line bg-surface p-2 shadow-md"
          >
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block min-h-11 rounded-[var(--radius-sm)] px-3 py-2.5 font-medium hover:bg-surface-2">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/weekly-chore-chart"
                  className="block min-h-11 rounded-[var(--radius-sm)] px-3 py-2.5 font-medium hover:bg-surface-2"
                >
                  Weekly Chart
                </Link>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <circle cx="14" cy="14" r="13" fill="#1f1f1c" />
      <path d="M14 14 L14 2 A12 12 0 0 1 24.4 8 Z" fill="#F9C74F" />
      <path d="M14 14 L24.4 8 A12 12 0 0 1 24.4 20 Z" fill="#43AA8B" />
      <path d="M14 14 L24.4 20 A12 12 0 0 1 14 26 Z" fill="#F3722C" />
      <path d="M14 14 L14 26 A12 12 0 0 1 3.6 20 Z" fill="#577590" />
      <path d="M14 14 L3.6 20 A12 12 0 0 1 3.6 8 Z" fill="#90BE6D" />
      <path d="M14 14 L3.6 8 A12 12 0 0 1 14 2 Z" fill="#F94144" />
      <circle cx="14" cy="14" r="3" fill="#fff" />
    </svg>
  );
}
