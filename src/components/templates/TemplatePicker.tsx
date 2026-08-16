"use client";

import { useEffect, useRef } from "react";
import { TEMPLATES, templateChores } from "@/lib/chores/templates";
import type { Template } from "@/lib/chores/types";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (template: Template, mode: "replace" | "add") => void;
  currentTemplateId: string | null;
};

const GROUPS: { id: Template["group"]; label: string }[] = [
  { id: "household", label: "Household" },
  { id: "situations", label: "Situations" },
  { id: "rooms", label: "By room" },
  { id: "kids", label: "Kids (by age group)" },
];

/**
 * Inline template panel (not a modal). Each template can replace the wheel or
 * add its chores to what's already there.
 */
export function TemplatePicker({ open, onClose, onPick, currentTemplateId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) ref.current?.querySelector<HTMLElement>("button")?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className="rounded-[var(--radius-md)] border border-line bg-surface p-4"
      role="region"
      aria-labelledby="templates-heading"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 id="templates-heading" className="font-semibold">
          Templates
        </h3>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="mb-3 text-sm text-muted">Pick a starting point, then edit anything you like.</p>
      <div className="space-y-4">
        {GROUPS.map((g) => (
          <div key={g.id}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g.label}</h4>
            <ul className="space-y-1.5">
              {TEMPLATES.filter((t) => t.group === g.id).map((t) => {
                const count = templateChores(t).length;
                const active = t.id === currentTemplateId;
                return (
                  <li
                    key={t.id}
                    className={`flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 ${active ? "border-accent bg-accent-soft/50" : "border-line"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">
                        {t.name} <span className="text-xs font-normal text-muted">· {count} chores</span>
                      </p>
                      <p className="text-xs text-muted">{t.tagline}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="primary" onClick={() => onPick(t, "replace")} aria-label={`Use ${t.name} template`}>
                        Use
                      </Button>
                      <Button size="sm" onClick={() => onPick(t, "add")} aria-label={`Add ${t.name} chores to the wheel`}>
                        + Add
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
