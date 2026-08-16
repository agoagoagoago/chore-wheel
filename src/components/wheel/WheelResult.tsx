"use client";

import type { WheelItem } from "@/lib/wheel/state";
import { Button } from "@/components/ui/Button";

type Props = {
  result: WheelItem | null;
  spinning: boolean;
  itemCount: number;
  onSpinAgain: () => void;
  onMarkDone: (item: WheelItem) => void;
  onRemove: (item: WheelItem) => void;
  stillOnWheel: boolean;
};

const SPARKS = [
  { dx: "-38px", dy: "-30px" },
  { dx: "34px", dy: "-36px" },
  { dx: "-46px", dy: "8px" },
  { dx: "44px", dy: "10px" },
  { dx: "-18px", dy: "-46px" },
  { dx: "16px", dy: "-48px" },
];

/**
 * Result announcement. The live region is always mounted so screen readers
 * hear changes; the visual card only appears when there is a result.
 */
export function WheelResult({ result, spinning, itemCount, onSpinAgain, onMarkDone, onRemove, stillOnWheel }: Props) {
  return (
    <div className="min-h-10">
      <p className="sr-only" aria-live="assertive" aria-atomic="true">
        {spinning ? "Spinning the wheel…" : result ? `Your chore: ${result.name}` : ""}
      </p>
      {result && !spinning ? (
        <div
          key={result.id + result.name}
          className="result-pop relative rounded-[var(--radius-md)] border border-accent/40 bg-accent-soft px-4 py-4 text-center"
          aria-hidden="false"
        >
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-3 h-0 w-0">
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className="sparkle absolute block h-2 w-2 rounded-full"
                style={{ ["--dx" as string]: s.dx, ["--dy" as string]: s.dy, background: i % 2 ? "#F9C74F" : "#0f766e" }}
              />
            ))}
          </span>
          <p className="text-sm font-medium uppercase tracking-wide text-accent-strong">Your chore</p>
          <p className="mt-1 break-words text-2xl font-bold leading-tight sm:text-3xl">{result.name}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={onSpinAgain} disabled={itemCount === 0}>
              Spin again
            </Button>
            {stillOnWheel ? (
              <>
                <Button onClick={() => onMarkDone(result)}>Mark done</Button>
                <Button variant="ghost" onClick={() => onRemove(result)}>
                  Remove from wheel
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="pt-2 text-center text-sm text-muted">
          {spinning ? "Spinning…" : itemCount === 0 ? "Add some chores to get started." : "Press Spin to pick a chore at random."}
        </p>
      )}
    </div>
  );
}
