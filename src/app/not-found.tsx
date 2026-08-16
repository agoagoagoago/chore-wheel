import Link from "next/link";
import { Container } from "@/components/content/Section";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">404</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">That page isn&apos;t on the wheel</h1>
        <p className="mt-3 text-muted">The link may be old or mistyped. The chore wheel itself is right here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonClass("primary", "md")}>
            Go to the chore wheel
          </Link>
          <Link href="/chore-list" className={buttonClass("secondary", "md")}>
            Browse the chore list
          </Link>
        </div>
      </div>
    </Container>
  );
}
