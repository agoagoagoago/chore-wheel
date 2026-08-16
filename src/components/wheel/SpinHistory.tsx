"use client";

import type { SpinRecord } from "@/lib/wheel/state";
import { Button } from "@/components/ui/Button";

type Props = {
  history: SpinRecord[];
  doneToday: SpinRecord[];
  onClear: () => void;
};

const fmt = (ts: number) => {
  const d = new Date(ts);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function SpinHistory({ history, doneToday, onClear }: Props) {
  if (history.length === 0 && doneToday.length === 0) return null;
  return (
    <details className="group rounded-[var(--radius-md)] border border-line bg-surface">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-2 font-medium [&::-webkit-details-marker]:hidden">
        <span>
          Previous results{" "}
          <span className="text-sm font-normal text-muted">
            ({history.length}
            {doneToday.length ? ` · ${doneToday.length} done today` : ""})
          </span>
        </span>
        <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-line px-4 py-3">
        {doneToday.length ? (
          <>
            <h3 className="text-sm font-semibold text-accent-strong">Done today</h3>
            <ul className="mb-3 mt-1 space-y-1 text-sm">
              {doneToday.map((r, i) => (
                <li key={`${r.id}-${i}`} className="flex justify-between gap-3">
                  <span className="line-through decoration-muted/60">{r.name}</span>
                  <span className="shrink-0 text-muted">{fmt(r.at)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {history.length ? (
          <>
            <h3 className="text-sm font-semibold">Spins</h3>
            <ol className="mt-1 max-h-56 space-y-1 overflow-y-auto text-sm">
              {history.map((r, i) => (
                <li key={`${r.id}-${r.at}-${i}`} className="flex justify-between gap-3">
                  <span className="truncate">{r.name}</span>
                  <span className="shrink-0 text-muted">{fmt(r.at)}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear history
          </Button>
        </div>
      </div>
    </details>
  );
}
