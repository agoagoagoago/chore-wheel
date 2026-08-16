import type { Metadata } from "next";
import Link from "next/link";
import { ChoreWheelApp } from "@/components/wheel/ChoreWheelApp";
import { Container, Section, RelatedLinks } from "@/components/content/Section";
import { TemplateCards } from "@/components/content/TemplateCards";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdSlot } from "@/components/ads/AdSlot";
import { pageMetadata } from "@/lib/seo";
import { CHORES } from "@/lib/chores/data";
import { AGE_LABEL } from "@/lib/chores/categories";
import { KIDS_SUPERVISION_NOTE } from "@/lib/chores/templates";
import type { AgeGroup } from "@/lib/chores/types";

export const metadata: Metadata = pageMetadata({
  title: "Chore Wheel for Kids – Make Household Tasks More Fun",
  description:
    "A kids' chore wheel with age-grouped chores for younger children, school-age kids and teens. Spin to pick a chore, assign chores to each child, print the list.",
  path: "/chore-wheel-for-kids",
  absoluteTitle: true,
});

const AGES: AgeGroup[] = ["younger", "school", "teen"];

export default function KidsPage() {
  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Chore Wheel" },
            { href: "/chore-wheel-for-kids", label: "Chore Wheel for Kids" },
          ]}
        />
        <div className="mb-6 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Chore Wheel for Kids</h1>
          <p className="mt-2 text-lg text-muted">
            A spin of the wheel is easier to accept than being told. This wheel starts with school-age chores — switch to the younger-kids
            or teens template, add your own, and assign chores to each child.
          </p>
        </div>
        <ChoreWheelApp presetTemplateId="kids-school" />
      </Container>

      <Container className="mt-10">
        <AdSlot slot="kids-after-tool" format="horizontal" />
      </Container>

      <Container className="mt-4">
        <div className="max-w-3xl">
          <Section id="age-groups" title="Chores by age group">
            <p>
              {KIDS_SUPERVISION_NOTE} These groupings reflect what most children can manage, not what any particular child should be doing.
            </p>
            <TemplateCards ids={["kids-younger", "kids-school", "kids-teens"]} toolPath="/chore-wheel-for-kids" />
            <div className="not-prose mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 text-left">
                    {AGES.map((a) => (
                      <th key={a} scope="col" className="px-3 py-2 font-semibold">
                        {AGE_LABEL[a]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-top">
                    {AGES.map((a) => (
                      <td key={a} className="px-3 py-2">
                        <ul className="space-y-1">
                          {CHORES.filter((c) => c.kidFriendly && c.minAge === a)
                            .slice(0, 12)
                            .map((c) => (
                              <li key={c.id}>{c.name}</li>
                            ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <h3>A note on safety</h3>
            <p>
              Anything involving heat, sharp tools, chemicals, ladders or heavy machinery (stovetop, oven, mower, gutters, strong bathroom
              cleaners) is left off the younger templates on purpose and marked for teens or adults. Whether a given child is ready is your
              call — an adult should be nearby the first few times regardless of age.
            </p>
          </Section>

          <Section id="making-it-work" title="Making the chore wheel work with kids">
            <ul>
              <li>
                <strong>Let them spin.</strong> The wheel is neutral in a way a parent isn&apos;t. &ldquo;The wheel says dishes&rdquo; lands
                better than &ldquo;I say dishes&rdquo;.
              </li>
              <li>
                <strong>Keep the wheel short.</strong> Five to eight chores a child can actually finish beats a wall of twenty. Use{" "}
                <em>Remove the winning chore after each spin</em> so the same job can&apos;t come up twice in one session.
              </li>
              <li>
                <strong>Assign, then print.</strong> With more than one child, use <em>Assign to people</em> and print the sheet — the tick
                box column is there so they can check off their own chores.
              </li>
              <li>
                <strong>Turn on Fair Rotation.</strong> Siblings notice unfairness instantly. Fair Rotation avoids handing the same child
                the same chore repeatedly and evens out totals over time.
              </li>
              <li>
                <strong>Mark done.</strong> The <em>Mark done</em> button moves the chore into today&apos;s done list — a small, visible
                win.
              </li>
            </ul>
          </Section>

          <Section id="example" title="Example: a Saturday morning wheel">
            <p>For two school-age children, a wheel that fits before lunch might be:</p>
            <ul>
              <li>Tidy the bedroom · Change the bed sheets · Vacuum the bedroom</li>
              <li>Unload the dishwasher · Take out the recycling · Wipe appliance fronts</li>
              <li>Water the plants · Fold the laundry (towels and socks)</li>
            </ul>
            <p>
              Add both names, press <em>Assign chores</em>, and each child gets four. Anything left over rolls to next week — save it as
              &ldquo;Saturday chores&rdquo; so it&apos;s one tap to reload.
            </p>
          </Section>

          <RelatedLinks
            links={[
              { href: "/", label: "Chore Wheel", blurb: "The full wheel with every template and option." },
              { href: "/family-chore-wheel", label: "Family chore wheel", blurb: "Adults and kids on one wheel, with a weekly routine." },
              {
                href: "/chore-list",
                label: "Household chore list",
                blurb: "Filter kid-friendly chores by room and add them to the wheel.",
              },
              { href: "/weekly-chore-chart", label: "Weekly chore chart", blurb: "A printable week-at-a-glance chart for the fridge." },
            ]}
          />
          <p className="mt-6 text-sm text-muted">
            Back to the <Link href="/">main chore wheel</Link>.
          </p>
        </div>
      </Container>
    </>
  );
}
