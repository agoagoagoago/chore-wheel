import { ANALYTICS_ENABLED } from "@/config/site";

/**
 * Analytics abstraction. Events carry counts and flags only — never names,
 * chores or any user-entered text. When no provider is configured, `track` is
 * a no-op. Any provider error is swallowed so analytics can never break the
 * tool.
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

export function track(event: AnalyticsEvent): void {
  if (!ANALYTICS_ENABLED) return;
  try {
    const { name, ...params } = event;
    const w = window as unknown as { gtag?: Gtag };
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params);
    }
  } catch {
    /* never throw from analytics */
  }
}
