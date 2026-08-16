"use client";

import type { ReactNode } from "react";

type Props = {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
};

/** Accessible switch built on a real checkbox. */
export function Toggle({ id, checked, onChange, label, description }: Props) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 py-2 cursor-pointer min-h-11">
      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="block h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2"
        />
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </span>
      <span className="text-[0.95rem] leading-snug">
        <span className="font-medium">{label}</span>
        {description ? <span className="block text-sm text-muted">{description}</span> : null}
      </span>
    </label>
  );
}
