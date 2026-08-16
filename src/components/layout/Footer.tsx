import Link from "next/link";
import { SITE_NAME } from "@/config/site";

const LINKS = [
  { href: "/", label: "Chore Wheel" },
  { href: "/chore-list", label: "Chore List" },
  { href: "/weekly-chore-chart", label: "Weekly Chore Chart" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-sm">
          <p className="font-semibold text-ink">{SITE_NAME}</p>
          <p className="mt-1">A free chore wheel for picking and assigning household chores. Everything you enter stays in your browser.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block min-h-8 py-1 hover:text-ink hover:underline underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
