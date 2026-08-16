import type { ReactNode } from "react";
import { Container } from "@/components/content/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

/** Shared shell for About / Contact / Privacy / Terms / Cookies. */
export function LegalPage({ title, path, intro, children }: { title: string; path: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <Container className="pt-6 sm:pt-8">
      <Breadcrumbs
        items={[
          { href: "/", label: "Chore Wheel" },
          { href: path, label: title },
        ]}
      />
      <article className="prose max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {intro ? <p className="mt-2 text-lg text-muted">{intro}</p> : null}
        {children}
      </article>
    </Container>
  );
}
