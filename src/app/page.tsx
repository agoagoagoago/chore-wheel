import type { Metadata } from "next";
import Link from "next/link";
import { ChoreWheelApp } from "@/components/wheel/ChoreWheelApp";
import { Container, Section, RelatedLinks, WithSidebarAd } from "@/components/content/Section";
import { TemplateCards } from "@/components/content/TemplateCards";
import { AdSlot } from "@/components/ads/AdSlot";
import { pageMetadata } from "@/lib/seo";
import { CHORES, DEFAULT_WHEEL_IDS, getChores } from "@/lib/chores/data";
import { CATEGORIES } from "@/lib/chores/categories";
import { LIMITS } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Chore Wheel – Randomly Pick & Assign Household Chores",
  description:
    "Add your chores, spin the wheel, and let it decide who does what. Assign chores to family members or roommates fairly, save your wheel, share it, and print the results. Free, no sign-up.",
  path: "/",
});

const ROOM_IDS = ["kitchen", "bathroom", "bedroom", "living", "laundry", "outdoor"] as const;

export default function HomePage() {
  const defaults = getChores(DEFAULT_WHEEL_IDS);
  return (
    <>
      <Container className="pt-8 sm:pt-10">
        <div className="mb-6 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Chore Wheel</h1>
          <p className="mt-2 text-lg text-muted">
            Let the wheel decide who does what. Add your household chores, spin to pick one at random, or assign chores to people in one
            click.
          </p>
        </div>

        <ChoreWheelApp />
      </Container>

      <Container className="mt-10">
        <AdSlot slot="home-after-tool" format="horizontal" />
      </Container>

      <Container className="mt-4">
        <WithSidebarAd slot="home-sidebar">
          <div className="max-w-3xl">
            <Section id="how-to-use" title="How to use the chore wheel">
              <ol>
                <li>
                  <strong>Add your chores.</strong> Type them in one at a time, paste a comma-separated list, or start from a template such
                  as Kitchen, Roommates or Kids. Edit, reorder or remove anything by tapping it.
                </li>
                <li>
                  <strong>Spin.</strong> The wheel picks one chore at random and announces it. Spin again, mark it done, or take it off the
                  wheel so it can&apos;t come up twice.
                </li>
                <li>
                  <strong>Assign to people (optional).</strong> Switch to <em>Assign to people</em>, add names, and press{" "}
                  <em>Assign chores</em> to hand out every chore at once. Reroll any single line you don&apos;t like.
                </li>
                <li>
                  <strong>Save, share or print.</strong> Your wheel is remembered on this device automatically. Save several named wheels,
                  copy a share link, or print today&apos;s assignments.
                </li>
              </ol>
              <p>
                Nothing you type is sent anywhere: chores, names and history live in your browser. Read more on the{" "}
                <Link href="/privacy">privacy page</Link>.
              </p>
            </Section>

            <Section id="templates" title="Popular chore wheel ideas">
              <p>Every template is a starting point — load one and add or remove chores to fit your home.</p>
              <TemplateCards ids={["everyday", "quick-10", "family", "roommates", "weekend-reset", "kids-school"]} />
              <p className="mt-3 text-sm">
                Looking for something specific? Browse the full <Link href="/chore-list">household chore list</Link> and add any chores
                straight to your wheel.
              </p>
            </Section>

            <Section id="assign-fairly" title="Assign chores fairly">
              <p>
                A single spin answers &ldquo;what should I do next?&rdquo;. Assign mode answers &ldquo;who does what?&rdquo;: it shuffles
                the chores on the wheel and hands them out so that every chore is used once before any repeats. If there are more people
                than chores, someone gets a free round; if there are more chores than people, the extras are spread as evenly as possible.
              </p>
              <h3>Fair Rotation</h3>
              <p>
                Random is fair on average, but any run of random draws can give the same person the worst chore three weeks running. Turn on{" "}
                <strong>Fair Rotation</strong> and the wheel remembers recent assignments (on this device only) and prefers pairings that
                haven&apos;t happened lately, while still keeping the totals balanced. It reduces repeats; it doesn&apos;t make any
                mathematical guarantee, and you can always reroll a line or clear the history.
              </p>
            </Section>

            <AdSlot slot="home-mid-content" format="rectangle" className="my-10" />

            <Section id="chores-by-room" title="Chore ideas by room">
              <p>
                Stuck for what to put on the wheel? Here is a taste of the chore library — each room links to the full list with frequency
                and effort, where you can tick chores and add them to your wheel in one go.
              </p>
              <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ROOM_IDS.map((id) => {
                  const cat = CATEGORIES.find((c) => c.id === id)!;
                  const chores = CHORES.filter((c) => c.category === id).slice(0, 6);
                  return (
                    <div key={id} className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
                      <h3 className="font-semibold">
                        <Link href={`/chore-list#${id}`} className="hover:underline underline-offset-4">
                          {cat.label} chores
                        </Link>
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        {chores.map((c) => (
                          <li key={c.id}>{c.name}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section id="who-its-for" title="Chore wheels for every household">
              <h3>Families</h3>
              <p>
                Give each family member a fair share without the weekly negotiation. Add everyone&apos;s name, load the Family template,
                assign, and stick the printout on the fridge. See the <Link href="/family-chore-wheel">family chore wheel</Link> for a
                weekly routine example and rotation tips.
              </p>
              <h3>Kids</h3>
              <p>
                A spinning wheel turns &ldquo;go tidy your room&rdquo; into a small game. The{" "}
                <Link href="/chore-wheel-for-kids">chore wheel for kids</Link> comes preloaded with age-grouped templates (younger kids,
                school-age, teens) and notes on what usually needs supervision.
              </p>
              <h3>Roommates</h3>
              <p>
                Shared flats run on chores nobody owns. The <Link href="/roommate-chore-wheel">roommate chore wheel</Link> pairs a
                shared-apartment template with assign mode and Fair Rotation so the bathroom doesn&apos;t always land on the same person.
              </p>
            </Section>

            <Section id="how-it-works" title="How is the winner chosen?">
              <p>
                When you press Spin, the wheel first picks a winning chore using your browser&apos;s built-in random number generator (
                <code>crypto.getRandomValues</code>, with a fallback to <code>Math.random</code> on very old browsers), giving every chore
                on the wheel an equal chance. Only then does the wheel animate — the spin is designed to land on the chore that was already
                chosen, so the animation can never influence the result. If you prefer reduced motion, the wheel simply jumps to the result
                and announces it.
              </p>
              <p>
                We don&apos;t weight chores, remember &ldquo;lucky&rdquo; segments, or nudge results in any direction. The default wheel has{" "}
                {defaults.length} chores; you can add up to {LIMITS.maxChores}.
              </p>
            </Section>

            <Section id="faq" title="Frequently asked questions">
              <h3>Is the chore wheel free?</h3>
              <p>Yes. There is no account, no sign-up and no limit on how many times you spin.</p>
              <h3>Will my chores still be here tomorrow?</h3>
              <p>
                Yes, as long as you use the same browser on the same device — the wheel is saved automatically in your browser&apos;s local
                storage. Clearing site data or using private browsing will reset it. To keep several wheels, use <em>Save wheel</em>; to
                move a wheel to another device, use <em>Share wheel</em> and open the link there.
              </p>
              <h3>Can I stop a chore from coming up twice?</h3>
              <p>
                Turn on <em>Remove the winning chore after each spin</em> under Options, or use <em>Mark done</em> /{" "}
                <em>Remove from wheel</em> on the result card.
              </p>
              <h3>How many people can I assign chores to?</h3>
              <p>
                Up to {LIMITS.maxPeople} people and {LIMITS.maxChores} chores. That covers households, flat-shares and most classrooms or
                small offices.
              </p>
              <h3>Does sharing upload my chore list?</h3>
              <p>
                No. The share link contains the wheel itself, encoded in the part of the URL after the <code>#</code>, which browsers never
                send to the server. Anyone with the link can open the wheel, so don&apos;t include information you wouldn&apos;t want passed
                on.
              </p>
              <h3>Can I use it for things other than chores?</h3>
              <p>
                Of course — it&apos;s a general random picker under the hood. But it&apos;s designed around household chores: the templates,
                the chore list and the assignment mode are all built for that.
              </p>
            </Section>

            <RelatedLinks
              links={[
                {
                  href: "/chore-list",
                  label: "Household chore list",
                  blurb: "Every chore by room, frequency and effort — add them to your wheel.",
                },
                { href: "/weekly-chore-chart", label: "Weekly chore chart", blurb: "Plan the whole week for everyone and print it." },
                {
                  href: "/chore-wheel-for-kids",
                  label: "Chore wheel for kids",
                  blurb: "Age-grouped templates and tips for making chores stick.",
                },
                { href: "/roommate-chore-wheel", label: "Roommate chore wheel", blurb: "Divide flat-share chores without the argument." },
              ]}
            />
          </div>
        </WithSidebarAd>
      </Container>
    </>
  );
}
