import type { Metadata } from "next";
import Link from "next/link";
import { ChoreLibraryBrowser } from "@/components/library/ChoreLibraryBrowser";
import { Container, RelatedLinks, WithSidebarAd } from "@/components/content/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdSlot } from "@/components/ads/AdSlot";
import { pageMetadata } from "@/lib/seo";
import { CHORES } from "@/lib/chores/data";
import { CATEGORIES } from "@/lib/chores/categories";

export const metadata: Metadata = pageMetadata({
  title: "Household Chore List by Room, Frequency & Effort",
  description:
    "A complete household chore list organised by room — kitchen, bathroom, bedroom, living areas, laundry, outdoor and pets — with how often each chore is usually done and how long it takes. Tick chores and add them straight to your chore wheel.",
  path: "/chore-list",
});

export default function ChoreListPage() {
  const daily = CHORES.filter((c) => c.frequency === "daily").length;
  const weekly = CHORES.filter((c) => c.frequency === "weekly").length;
  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Chore Wheel" },
            { href: "/chore-list", label: "Chore List" },
          ]}
        />
        <WithSidebarAd slot="chore-list-sidebar">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Household Chore List</h1>
            <p className="mt-2 text-lg text-muted">
              {CHORES.length} household chores organised by room, with the usual frequency and rough effort for each. Tick the ones that
              apply to your home and add them to your{" "}
              <Link href="/" className="underline underline-offset-4">
                chore wheel
              </Link>{" "}
              in one go.
            </p>

            <nav aria-label="Rooms" className="mt-5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-line-strong bg-surface px-3 text-sm font-medium hover:bg-surface-2"
                >
                  {c.label}
                </a>
              ))}
            </nav>

            <div className="prose mt-6">
              <h2 className="!mt-0 text-xl">How to use this list</h2>
              <p>
                Nobody does every chore here. Treat it as a menu: {daily} chores are typically daily, {weekly} weekly, and the rest monthly
                or occasional. Use the filters to narrow to quick jobs, kid-friendly jobs, or a frequency, then <em>Select all</em> in a
                room and press <em>Add to my wheel</em>. Anything already on your wheel is skipped, so you can come back and add more later.
              </p>
            </div>

            <div className="mt-6">
              <ChoreLibraryBrowser />
            </div>

            <div className="prose mt-12">
              <h2>Daily, weekly, monthly — a rough rhythm</h2>
              <p>
                Frequencies here are typical, not rules. A busy kitchen needs the counters wiped and the floor swept daily; a rarely used
                guest bathroom can go a fortnight. A workable pattern for most homes:
              </p>
              <ul>
                <li>
                  <strong>Daily (5–15 minutes):</strong> dishes, counters, a quick sweep, trash when full, beds, a ten-minute declutter.
                </li>
                <li>
                  <strong>Weekly (an hour or two, split up):</strong> bathrooms, floors, dusting, laundry, sheets, bins out, plants.
                </li>
                <li>
                  <strong>Monthly:</strong> fridge, oven and microwave, baseboards, windows inside, air filter, smoke alarms.
                </li>
                <li>
                  <strong>Occasional / seasonal:</strong> gutters, outside windows, closet declutter, mattress rotation, grill, snow.
                </li>
              </ul>
              <p>
                The <Link href="/weekly-chore-chart">weekly chore chart</Link> lays these out per day and per person; the{" "}
                <Link href="/">chore wheel</Link> is for deciding on the spot.
              </p>
            </div>

            <AdSlot slot="chore-list-end" format="horizontal" className="mt-10" />

            <RelatedLinks
              links={[
                { href: "/", label: "Chore Wheel", blurb: "Spin to pick a chore, or assign the whole list to people." },
                { href: "/weekly-chore-chart", label: "Weekly chore chart", blurb: "Turn the list into a printable week." },
                { href: "/chore-wheel-for-kids", label: "Chore wheel for kids", blurb: "Age-grouped kid-friendly chores." },
                { href: "/roommate-chore-wheel", label: "Roommate chore wheel", blurb: "Common-area chores for shared flats." },
              ]}
            />
          </div>
        </WithSidebarAd>
      </Container>
    </>
  );
}
