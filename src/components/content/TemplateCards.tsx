import { TEMPLATES, templateChores } from "@/lib/chores/templates";

/**
 * Server-rendered template overview. Each card links to the tool with a
 * `#t=` hash, which the app reads on load and on hashchange. Plain anchors
 * (not next/link) so a same-page hash change fires `hashchange`.
 */
export function TemplateCards({ ids, toolPath = "/" }: { ids?: string[]; toolPath?: string }) {
  const list = ids
    ? ids.map((id) => TEMPLATES.find((t) => t.id === id)).filter((t): t is (typeof TEMPLATES)[number] => Boolean(t))
    : TEMPLATES;
  return (
    <ul className="not-prose grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((t) => {
        const chores = templateChores(t);
        return (
          <li key={t.id} className="flex flex-col rounded-[var(--radius-md)] border border-line bg-surface p-4">
            <h3 className="font-semibold">{t.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{t.tagline}</p>
            <p className="mt-2 text-sm">
              {chores
                .slice(0, 5)
                .map((c) => c.name)
                .join(" · ")}
              {chores.length > 5 ? ` · +${chores.length - 5} more` : ""}
            </p>
            <a
              href={`${toolPath}#t=${t.id}`}
              className="mt-3 inline-flex min-h-10 items-center self-start rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-medium hover:bg-surface-2"
            >
              Load this wheel
            </a>
          </li>
        );
      })}
    </ul>
  );
}
