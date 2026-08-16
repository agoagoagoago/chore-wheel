import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { CHORES } from "@/lib/chores/data";
import { TEMPLATES } from "@/lib/chores/templates";
import { SITE_NAME } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "About Chore Wheel – Who Made It and How It Works",
  absoluteTitle: true,
  description: `What ${SITE_NAME} is, how the wheel picks a chore, how Fair Rotation works, and how your data is handled.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage
      title={`About ${SITE_NAME}`}
      path="/about"
      intro="A small, free tool for one recurring household problem: deciding who does what."
    >
      <h2>What it does</h2>
      <p>
        {SITE_NAME} is an interactive chore wheel. You add household chores (or load one of {TEMPLATES.length} templates built from a
        library of {CHORES.length} chores), spin to pick one at random, or add the people in your home and assign every chore in one go.
        Wheels can be saved on your device, shared as a link, and assignments can be copied or printed. There is also a{" "}
        <Link href="/chore-list">categorised chore list</Link> and a <Link href="/weekly-chore-chart">printable weekly chart</Link>.
      </p>

      <h2>How the wheel works</h2>
      <p>
        When you press Spin, a winner is chosen first using the browser&apos;s built-in random number generator (
        <code>crypto.getRandomValues</code>, falling back to <code>Math.random</code> where unavailable), so every chore on the wheel has
        the same chance. The animation then rotates the wheel to land on that chore. The animation cannot change the outcome, and there is
        no weighting or memory of previous spins in the basic wheel.
      </p>
      <h3>Fair Rotation</h3>
      <p>
        Assign mode hands each chore out once before any is repeated, and balances how many chores each person gets. With Fair Rotation on,
        the tool also looks at recent assignments stored in your browser and prefers pairings that haven&apos;t happened lately (the same
        person and the same chore, weighted by how recent), then breaks ties at random. It reduces repeats; it does not guarantee any exact
        distribution, which is why you can always reroll a line or clear the history.
      </p>

      <h2>Your data</h2>
      <p>
        Chores, names, saved wheels and history are stored only in your browser&apos;s local storage. Nothing you type is sent to a server.
        Share links carry the wheel in the part of the URL after the <code>#</code>, which browsers don&apos;t transmit. See the{" "}
        <Link href="/privacy">privacy policy</Link> for the details, including how advertising and analytics are handled if they are ever
        enabled.
      </p>

      <h2>Who maintains it</h2>
      <p>
        {SITE_NAME} is an independent project built and maintained by Adrian, a Singapore-based developer and father who knows the daily
        chaos of managing household chores with kids — this is the tool he wanted for his own home.
        Questions, corrections and suggestions are welcome via the <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
