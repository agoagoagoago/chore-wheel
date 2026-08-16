import type { Metadata } from "next";
import Link from "next/link";
import { ChoreWheelApp } from "@/components/wheel/ChoreWheelApp";
import { Container, Section, RelatedLinks } from "@/components/content/Section";
import { TemplateCards } from "@/components/content/TemplateCards";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdSlot } from "@/components/ads/AdSlot";
import { pageMetadata } from "@/lib/seo";
import { getTemplate, templateChores } from "@/lib/chores/templates";

export const metadata: Metadata = pageMetadata({
  title: "Roommate Chore Wheel – Randomly Divide Apartment Chores",
  description:
    "Split shared-apartment chores between roommates at random, with Fair Rotation so nobody gets the bathroom every week. Copy to the group chat or print.",
  path: "/roommate-chore-wheel",
  absoluteTitle: true,
});

export default function RoommatePage() {
  const template = getTemplate("roommates")!;
  const chores = templateChores(template);
  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Chore Wheel" },
            { href: "/roommate-chore-wheel", label: "Roommate Chore Wheel" },
          ]}
        />
        <div className="mb-6 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Roommate Chore Wheel</h1>
          <p className="mt-2 text-lg text-muted">
            The chores nobody owns, divided by a wheel nobody can argue with. Preloaded with shared-apartment tasks — add your names,
            assign, and paste the result in the group chat.
          </p>
        </div>
        <ChoreWheelApp presetTemplateId="roommates" defaultTab="assign" />
      </Container>

      <Container className="mt-10">
        <AdSlot slot="roommates-after-tool" format="horizontal" />
      </Container>

      <Container className="mt-4">
        <div className="max-w-3xl">
          <Section id="shared-chores" title="What goes on a roommate chore wheel">
            <p>
              Personal spaces stay personal. The wheel is for common areas and shared supplies — the things that quietly get worse until
              someone cracks. The Roommate template starts with:
            </p>
            <ul className="columns-2 gap-6">
              {chores.map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
            <p>
              Add anything specific to your place: recycling day, the shared balcony, descaling the kettle. The{" "}
              <Link href="/chore-list">chore list</Link> has more to pick from.
            </p>
          </Section>

          <Section id="fairness" title="Keeping it fair between roommates">
            <ul>
              <li>
                <strong>Assign weekly, all at once.</strong> Press <em>Assign chores</em> on the same day each week. Everyone sees the same
                table — copy it into the chat so there&apos;s a record.
              </li>
              <li>
                <strong>Turn on Fair Rotation.</strong> It looks at recent assignments stored on the device that ran the draw and avoids
                giving the same person the same chore repeatedly, while keeping the number of chores per person even. It&apos;s a nudge, not
                a contract: if a line is genuinely unfair, reroll it in front of everyone.
              </li>
              <li>
                <strong>Split big chores.</strong> &ldquo;Clean the kitchen&rdquo; and &ldquo;Take out the trash&rdquo; aren&apos;t equal.
                Either split the kitchen into stovetop / counters / floor, or accept that the wheel evens out over weeks rather than days.
              </li>
              <li>
                <strong>Trade, don&apos;t skip.</strong> Rerolling one line swaps chores with someone else when everything is taken, so a
                trade never leaves a chore undone.
              </li>
              <li>
                <strong>Share the wheel itself.</strong> <em>Share wheel</em> creates a link containing the chores and names. Anyone in the
                flat can open it, run the assignment and post the result — the wheel doesn&apos;t belong to one phone.
              </li>
            </ul>
          </Section>

          <Section id="templates" title="Related templates">
            <TemplateCards
              ids={["roommates", "kitchen", "bathroom", "weekend-reset", "quick-10", "everyday"]}
              toolPath="/roommate-chore-wheel"
            />
          </Section>

          <RelatedLinks
            links={[
              { href: "/weekly-chore-chart", label: "Weekly chore chart", blurb: "Lay out who does what on which day, then print it." },
              { href: "/chore-list", label: "Household chore list", blurb: "Kitchen, bathroom and common-area chores with frequencies." },
              { href: "/family-chore-wheel", label: "Family chore wheel", blurb: "The same idea for households with kids." },
              { href: "/", label: "Chore Wheel", blurb: "The main tool with all templates and options." },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
