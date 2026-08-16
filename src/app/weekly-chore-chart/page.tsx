import type { Metadata } from "next";
import Link from "next/link";
import { WeeklyChart } from "@/components/chart/WeeklyChart";
import { Container, Section, RelatedLinks } from "@/components/content/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdSlot } from "@/components/ads/AdSlot";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Weekly Chore Chart – Plan & Print Who Does What",
  description:
    "An editable, printable weekly chore chart: add the people in your home, fill in each day or auto-fill from your chore wheel, then print it for the fridge.",
  path: "/weekly-chore-chart",
  absoluteTitle: true,
});

export default function WeeklyChartPage() {
  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Chore Wheel" },
            { href: "/weekly-chore-chart", label: "Weekly Chore Chart" },
          ]}
        />
        <div className="mb-6 max-w-2xl print:hidden">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Weekly Chore Chart</h1>
          <p className="mt-2 text-lg text-muted">
            A week at a glance: one row per person, one column per day. Type chores straight into the cells, or let the chart spread the
            chores from your{" "}
            <Link href="/" className="underline underline-offset-4">
              chore wheel
            </Link>{" "}
            across the week — then print it.
          </p>
        </div>
        <WeeklyChart />
      </Container>

      <Container className="mt-10 print:hidden">
        <AdSlot slot="chart-after-tool" format="horizontal" />
        <div className="max-w-3xl">
          <Section id="how-to-plan" title="How to plan a week of chores">
            <ol>
              <li>
                <strong>Decide what&apos;s weekly.</strong> Daily habits (dishes, beds, a quick tidy) don&apos;t need a chart. Put the
                chores that get skipped without a plan on it: bathrooms, floors, laundry, bins, plants.
              </li>
              <li>
                <strong>Spread, don&apos;t stack.</strong> Two or three short chores on a weekday and one longer job at the weekend is far
                more likely to happen than a Saturday marathon.
              </li>
              <li>
                <strong>Match chores to days.</strong> Bins out the night before collection; sheets on the day you have time to wash and dry
                them; grocery shopping the day after meal planning.
              </li>
              <li>
                <strong>Rotate weekly.</strong> Press <em>Auto-fill from my wheel</em> each week for a fresh random spread, or use the
                wheel&apos;s <Link href="/#assign-fairly">Fair Rotation</Link> for the assignments and copy them across.
              </li>
              <li>
                <strong>Print it.</strong> A chart on the fridge gets read; a chart in an app gets forgotten. Cells print with full day
                names and no buttons.
              </li>
            </ol>
          </Section>

          <Section id="chart-vs-wheel" title="Chart or wheel?">
            <p>
              Use the <Link href="/">chore wheel</Link> when the question is &ldquo;what now?&rdquo; or &ldquo;who gets this?&rdquo; —
              it&apos;s instant and it&apos;s fun. Use the chart when you want the whole week visible and agreed in advance. They share the
              same people and chores, so it&apos;s easy to move between them.
            </p>
          </Section>

          <RelatedLinks
            links={[
              { href: "/", label: "Chore Wheel", blurb: "Pick or assign chores at random." },
              {
                href: "/chore-list",
                label: "Household chore list",
                blurb: "Everything you might put on the chart, by room and frequency.",
              },
              { href: "/family-chore-wheel", label: "Family chore wheel", blurb: "Includes an example weekly routine." },
              { href: "/roommate-chore-wheel", label: "Roommate chore wheel", blurb: "Shared-apartment chores and fairness tips." },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
