import type { Metadata } from "next";
import Link from "next/link";
import { ChoreWheelApp } from "@/components/wheel/ChoreWheelApp";
import { Container, Section, RelatedLinks } from "@/components/content/Section";
import { TemplateCards } from "@/components/content/TemplateCards";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdSlot } from "@/components/ads/AdSlot";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Family Chore Wheel – Share Household Chores Fairly",
  description:
    "A family chore wheel with a ready-made template, assignment for the whole household, Fair Rotation and a printable weekly routine. Free and private.",
  path: "/family-chore-wheel",
  absoluteTitle: true,
});

const WEEK = [
  { day: "Monday", items: "Load & unload dishwasher · Take out the trash · 10-minute declutter" },
  { day: "Tuesday", items: "Wash a load of laundry · Fold the laundry · Wipe kitchen counters" },
  { day: "Wednesday", items: "Vacuum the living room · Water the plants · Empty all the small bins" },
  { day: "Thursday", items: "Clean the bathroom sink & mirror · Take out the recycling" },
  { day: "Friday", items: "Sweep & mop the kitchen floor · Tidy the entryway" },
  { day: "Saturday", items: "Change the bed sheets · Vacuum the bedrooms · Clean the bathroom" },
  { day: "Sunday", items: "Plan the week's meals · Grocery shopping · Clear out the fridge" },
];

export default function FamilyPage() {
  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Chore Wheel" },
            { href: "/family-chore-wheel", label: "Family Chore Wheel" },
          ]}
        />
        <div className="mb-6 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Family Chore Wheel</h1>
          <p className="mt-2 text-lg text-muted">
            One wheel for the whole household. Add everyone&apos;s name, press <em>Assign chores</em>, and let the wheel settle who does
            what this week — then print it for the fridge.
          </p>
        </div>
        <ChoreWheelApp presetTemplateId="family" defaultTab="assign" />
      </Container>

      <Container className="mt-10">
        <AdSlot slot="family-after-tool" format="horizontal" />
      </Container>

      <Container className="mt-4">
        <div className="max-w-3xl">
          <Section id="how-families-use-it" title="How families use the chore wheel">
            <p>
              Most families don&apos;t need a chore <em>system</em>; they need a quick, neutral way to decide and a piece of paper everyone
              can see. That&apos;s the whole workflow here:
            </p>
            <ol>
              <li>
                Load the Family template (or build your own from the <Link href="/chore-list">chore list</Link>).
              </li>
              <li>
                Add each family member under <em>Assign to people</em>. Include the adults — kids notice when they&apos;re missing.
              </li>
              <li>
                Press <em>Assign chores</em>. Reroll any line that genuinely doesn&apos;t fit (a toddler shouldn&apos;t get the oven).
              </li>
              <li>Print, or copy the assignments into your family chat.</li>
            </ol>
            <p>
              Save the wheel as &ldquo;Weekly family chores&rdquo; and it&apos;s one tap to reload next week. Turn on{" "}
              <strong>Fair Rotation</strong> so this week&apos;s draw takes last week&apos;s into account.
            </p>
          </Section>

          <Section id="rotation" title="Rotation ideas that actually stick">
            <ul>
              <li>
                <strong>Weekly reassign, same day.</strong> Sunday evening or Monday breakfast — the wheel remembers who had what, so nobody
                keeps the toilet forever.
              </li>
              <li>
                <strong>Split by size, not by count.</strong> Two quick chores can equal one long one. Put &ldquo;Clean the bathroom&rdquo;
                and &ldquo;Water the plants + Wipe surfaces&rdquo; on the wheel as separate entries so a big job isn&apos;t paired with
                another big job.
              </li>
              <li>
                <strong>Keep personal spaces off the wheel.</strong> Everyone makes their own bed; the wheel is for shared spaces.
              </li>
              <li>
                <strong>Let the youngest spin.</strong> The wheel is the boss for a minute, and that&apos;s the point.
              </li>
            </ul>
          </Section>

          <Section id="weekly-routine" title="Example weekly routine">
            <p>
              A light-touch routine for a household of three to five, drawn from the chore library. Assign the day&apos;s chores in the
              morning or build the whole week at once with the <Link href="/weekly-chore-chart">weekly chore chart</Link>.
            </p>
            <div className="not-prose overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 text-left">
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Day
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Chores to assign
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {WEEK.map((w) => (
                    <tr key={w.day} className="border-t border-line">
                      <td className="px-3 py-2 font-medium">{w.day}</td>
                      <td className="px-3 py-2">{w.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="templates" title="Templates that suit families">
            <TemplateCards
              ids={["family", "weekend-reset", "kids-younger", "kids-school", "kids-teens", "pets"]}
              toolPath="/family-chore-wheel"
            />
          </Section>

          <RelatedLinks
            links={[
              { href: "/chore-wheel-for-kids", label: "Chore wheel for kids", blurb: "Age-grouped chores and tips for younger children." },
              { href: "/weekly-chore-chart", label: "Weekly chore chart", blurb: "Plan every day of the week for everyone." },
              { href: "/chore-list", label: "Household chore list", blurb: "Browse chores by room and add them to your wheel." },
              { href: "/", label: "Chore Wheel", blurb: "The main tool with all templates and options." },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
