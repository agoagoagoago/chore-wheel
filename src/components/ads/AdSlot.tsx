import { ADSENSE_PUBLISHER_ID, ADS_ENABLED, ADS_PLACEHOLDERS } from "@/config/site";

type Format = "horizontal" | "rectangle" | "vertical";

/** Reserved heights so an ad (or its absence) never shifts layout. */
const SIZES: Record<Format, { minHeight: number; label: string }> = {
  horizontal: { minHeight: 100, label: "728×90 / responsive banner" },
  rectangle: { minHeight: 250, label: "300×250 / responsive rectangle" },
  vertical: { minHeight: 600, label: "300×600 sidebar" },
};

type Props = {
  /** Stable placement id used later for reporting / A/B tests: e.g. "home-after-tool". */
  slot: string;
  format?: Format;
  className?: string;
};

/**
 * AdSense-ready placement.
 *
 * - When no publisher id is configured and placeholders are off (default),
 *   renders nothing at all — zero DOM, zero layout.
 * - With NEXT_PUBLIC_ADS_PLACEHOLDERS=true, renders a dashed box of the
 *   reserved size so layout can be checked.
 * - With a real publisher id, renders the reserved container. Wire the actual
 *   `<ins class="adsbygoogle">` + script here once approved — see README
 *   "AdSense" for the exact steps and the consent/CMP note.
 */
export function AdSlot({ slot, format = "horizontal", className = "" }: Props) {
  if (!ADS_ENABLED) return null;
  const size = SIZES[format];
  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slot}
      data-ad-format={format}
      className={`print:hidden mx-auto w-full max-w-4xl ${className}`}
      style={{ minHeight: size.minHeight }}
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-muted">Advertisement</p>
      {ADS_PLACEHOLDERS && !ADSENSE_PUBLISHER_ID ? (
        <div
          className="grid place-items-center rounded border border-dashed border-line-strong bg-surface-2 text-xs text-muted"
          style={{ minHeight: size.minHeight }}
        >
          Ad placeholder · {slot} · {size.label}
        </div>
      ) : (
        <div style={{ minHeight: size.minHeight }} data-adsense-publisher={ADSENSE_PUBLISHER_ID} />
      )}
    </aside>
  );
}
