"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CHORES } from "@/lib/chores/data";
import { CATEGORIES, EFFORT_LABEL, FREQUENCY_LABEL, AGE_LABEL } from "@/lib/chores/categories";
import type { Chore, ChoreCategory, Effort, Frequency } from "@/lib/chores/types";
import { setPendingAdd } from "@/lib/storage/local";
import { LIMITS } from "@/config/site";
import { Button } from "@/components/ui/Button";

type Filters = { kids: boolean; effort: Effort | "any"; frequency: Frequency | "any" };

const EFFORTS: Effort[] = ["quick", "medium", "long"];
const FREQS: Frequency[] = ["daily", "weekly", "monthly", "occasional"];

/**
 * The chore library. Server-rendered lists (this is a client component but it
 * renders fully on the server), plus checkboxes and an "add to wheel" bar that
 * hand the selection to the tool via the URL hash.
 */
export function ChoreLibraryBrowser({ toolPath = "/" }: { toolPath?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [filters, setFilters] = useState<Filters>({ kids: false, effort: "any", frequency: "any" });

  const matches = (c: Chore) =>
    (!filters.kids || c.kidFriendly) &&
    (filters.effort === "any" || c.effort === filters.effort) &&
    (filters.frequency === "any" || c.frequency === filters.frequency);

  const visible = useMemo(() => CHORES.filter(matches), [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < LIMITS.maxChores) next.add(id);
      return next;
    });

  const selectCategory = (cat: ChoreCategory, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const c of visible.filter((c) => c.category === cat)) {
        if (on && next.size < LIMITS.maxChores) next.add(c.id);
        if (!on) next.delete(c.id);
      }
      return next;
    });

  const addToWheel = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setPendingAdd(ids);
    router.push(`${toolPath}#add=${ids.join(",")}`);
  };

  const filterActive = filters.kids || filters.effort !== "any" || filters.frequency !== "any";

  return (
    <div>
      {/* Filters */}
      <div
        className="mb-6 flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4"
        role="group"
        aria-label="Filter chores"
      >
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={filters.kids}
            onChange={(e) => setFilters((f) => ({ ...f, kids: e.target.checked }))}
            className="h-5 w-5 accent-accent"
          />
          Kid-friendly only
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">Effort</span>
          <select
            value={filters.effort}
            onChange={(e) => setFilters((f) => ({ ...f, effort: e.target.value as Filters["effort"] }))}
            className="min-h-11 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-[16px]"
          >
            <option value="any">Any</option>
            {EFFORTS.map((e) => (
              <option key={e} value={e}>
                {EFFORT_LABEL[e]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">Frequency</span>
          <select
            value={filters.frequency}
            onChange={(e) => setFilters((f) => ({ ...f, frequency: e.target.value as Filters["frequency"] }))}
            className="min-h-11 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2 text-[16px]"
          >
            <option value="any">Any</option>
            {FREQS.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABEL[f]}
              </option>
            ))}
          </select>
        </label>
        {filterActive ? (
          <Button size="sm" variant="ghost" onClick={() => setFilters({ kids: false, effort: "any", frequency: "any" })}>
            Reset filters
          </Button>
        ) : null}
        <p className="ml-auto text-sm text-muted" aria-live="polite">
          {visible.length} of {CHORES.length} chores
        </p>
      </div>

      {/* Category sections */}
      <div className="space-y-10">
        {CATEGORIES.map((cat) => {
          const chores = visible.filter((c) => c.category === cat.id);
          const allSelected = chores.length > 0 && chores.every((c) => selected.has(c.id));
          return (
            <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-heading`} className="scroll-mt-20">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id={`${cat.id}-heading`} className="text-xl font-bold">
                    {cat.label} chores
                  </h2>
                  <p className="text-sm text-muted">{cat.blurb}</p>
                </div>
                {chores.length > 0 ? (
                  <Button size="sm" onClick={() => selectCategory(cat.id, !allSelected)}>
                    {allSelected ? "Deselect all" : `Select all ${chores.length}`}
                  </Button>
                ) : null}
              </div>
              {chores.length === 0 ? (
                <p className="text-sm text-muted">No chores match the current filters.</p>
              ) : (
                <ul className="divide-y divide-line rounded-[var(--radius-md)] border border-line bg-surface">
                  {chores.map((c) => {
                    const id = `chore-${c.id}`;
                    return (
                      <li key={c.id} className="flex items-start gap-3 px-3 py-2.5">
                        <input
                          id={id}
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggle(c.id)}
                          className="mt-1 h-5 w-5 shrink-0 accent-accent"
                        />
                        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                          <span className="font-medium">{c.name}</span>
                          {c.description ? <span className="block text-sm text-muted">{c.description}</span> : null}
                          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                            <span>{FREQUENCY_LABEL[c.frequency]}</span>
                            <span>{EFFORT_LABEL[c.effort]}</span>
                            {c.kidFriendly && c.minAge ? (
                              <span className="text-accent-strong">Kids: {AGE_LABEL[c.minAge].toLowerCase()}+</span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {/* Sticky action bar */}
      <div
        className={`sticky bottom-0 z-20 mt-6 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-t-[var(--radius-md)] sm:border ${selected.size ? "" : "hidden"}`}
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <strong>{selected.size}</strong> chore{selected.size === 1 ? "" : "s"} selected
            {selected.size >= LIMITS.maxChores ? ` (maximum ${LIMITS.maxChores})` : ""}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
            <Button variant="primary" onClick={addToWheel}>
              Add {selected.size} chore{selected.size === 1 ? "" : "s"} to my wheel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
