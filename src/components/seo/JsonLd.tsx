/**
 * Renders a JSON-LD block. Data is always author-controlled (never user
 * input); `<` is escaped so a string can't close the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json">{json}</script>;
}
