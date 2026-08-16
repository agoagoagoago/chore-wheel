import { ANALYTICS_ENABLED } from "@/config/site";

/**
 * Analytics abstraction. Events carry counts and flags only — never names,
 * chores or any user-entered text. Providers: Fathom (NEXT_PUBLIC_FATHOM_SITE_ID)
 * and/or GA4 (NEXT_PUBLIC_GA_MEASUREMENT_ID). When neither is configured,
 * `track` is a no-op. Any provider error is swallowed so analytics can never
 * break the tool.
 */

export type AnalyticsEvent =
  | { name: "wheel_spin"; itemCount: number; fair: boolean }
  | { name: "chore_added"; itemCount: number }
  | { name: "chore_removed"; itemCount: number }
  | { name: "template_selected"; templateId: string }
  | { name: "assignment_generated"; peopleCount: number; itemCount: number; fair: boolean }
  | { name: "fair_rotation_enabled"; enabled: boolean }
  | { name: "share_created"; method: "copy" | "native" }
  | { name: "print_clicked"; source: "assignments" | "chart" }
  | { name: "saved_wheel_created"; savedCount: number }
  | { name: "library_add_to_wheel"; itemCount: number };

type Gtag = (...args: unknown[]) => void;
type Fathom = { trackEvent?: (name: string, opts?: { _value?: number }) => void };

export function track(event: AnalyticsEvent): void {
  if (!ANALYTICS_ENABLED) return;
  try {
    const { name, ...params } = event;
    const w = window as unknown as { gtag?: Gtag; fathom?: Fathom };
    // Fathom events are name-only; encode the one flag/count that matters in the name
    // (e.g. "wheel_spin", "assignment_generated_fair") so nothing user-entered is sent.
    if (typeof w.fathom?.trackEvent === "function") {
      const suffix = "fair" in params && params.fair ? "_fair" : "";
      w.fathom.trackEvent(`${name}${suffix}`);
    }
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params);
    }
  } catch {
    /* never throw from analytics */
  }
}
