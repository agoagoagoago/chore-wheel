"use client";

import type { WheelOptions as Opts } from "@/lib/wheel/state";
import { Toggle } from "@/components/ui/Toggle";
import { track } from "@/lib/analytics";

type Props = {
  options: Opts;
  onChange: (key: keyof Opts, value: boolean) => void;
  showFair?: boolean;
};

export function WheelOptions({ options, onChange, showFair = true }: Props) {
  return (
    <details className="group rounded-[var(--radius-md)] border border-line bg-surface">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-2 font-medium [&::-webkit-details-marker]:hidden">
        Options
        <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-line px-4 py-2">
        <Toggle
          id="opt-remove"
          checked={options.removeAfterSpin}
          onChange={(v) => onChange("removeAfterSpin", v)}
          label="Remove the winning chore after each spin"
          description="Handy for working through a list until nothing is left."
        />
        <Toggle
          id="opt-sound"
          checked={options.sound}
          onChange={(v) => onChange("sound", v)}
          label="Sound"
          description="A quiet tick when the wheel starts and stops."
        />
        {showFair ? (
          <Toggle
            id="opt-fair"
            checked={options.fairRotation}
            onChange={(v) => {
              onChange("fairRotation", v);
              track({ name: "fair_rotation_enabled", enabled: v });
            }}
            label="Fair Rotation (assign mode)"
            description="Uses this device's recent assignment history to avoid giving someone the same chore again and again."
          />
        ) : null}
      </div>
    </details>
  );
}
