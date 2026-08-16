"use client";

import { useState, type FormEvent } from "react";
import { KEYS, loadState } from "@/lib/storage/local";
import { createLocalStore, useHydrated, useLocalStore } from "@/lib/storage/store";
import { cleanName } from "@/lib/wheel/state";
import { shuffle } from "@/lib/wheel/random";
import { LIMITS } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { PrintPortal } from "@/components/ui/PrintPortal";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Chart = { title: string; people: string[]; cells: Record<string, string> };

const key = (p: number, d: number) => `${p}-${d}`;

const empty = (): Chart => ({ title: "", people: [], cells: {} });

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function normalizeChart(raw: unknown): Chart {
  if (!isRecord(raw)) return empty();
  const people = Array.isArray(raw.people)
    ? raw.people
        .slice(0, LIMITS.maxPeople)
        .map((p: unknown) => (typeof p === "string" ? cleanName(p) : ""))
        .filter(Boolean)
    : [];
  const cells: Record<string, string> = {};
  if (isRecord(raw.cells)) {
    for (const [k, v] of Object.entries(raw.cells)) {
      if (/^\d{1,2}-[0-6]$/.test(k) && typeof v === "string") cells[k] = v.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 300);
    }
  }
  return { title: typeof raw.title === "string" ? cleanName(raw.title) : "", people, cells };
}

/**
 * Chart store. On first load with no saved chart, people are borrowed from the
 * wheel so the chart isn't blank.
 */
const chartStore = createLocalStore<Chart>(KEYS.chart, empty, (raw) => normalizeChart(raw));

function seedFromWheel(current: Chart): Chart {
  if (current.people.length) return current;
  const wheel = loadState();
  if (wheel && wheel.people.length) return { ...current, people: wheel.people.map((p) => p.name), title: current.title || wheel.title };
  return current;
}

export function WeeklyChart() {
  return (
    <ToastProvider>
      <ChartInner />
    </ToastProvider>
  );
}

function ChartInner() {
  const toast = useToast();
  const stored = useLocalStore(chartStore);
  const hydrated = useHydrated();
  const chart = hydrated && !stored.people.length ? seedFromWheel(stored) : stored;
  const setChart = (next: Chart | ((prev: Chart) => Chart)) =>
    chartStore.set((prev) => {
      const base = prev.people.length ? prev : seedFromWheel(prev);
      return typeof next === "function" ? next(base) : next;
    });
  const [draft, setDraft] = useState("");

  const setCell = (p: number, d: number, value: string) => setChart((c) => ({ ...c, cells: { ...c.cells, [key(p, d)]: value } }));

  const addPerson = (e: FormEvent) => {
    e.preventDefault();
    const names = draft
      .split(/[\n,;]+/)
      .map(cleanName)
      .filter(Boolean);
    if (!names.length) return;
    setChart((c) => ({ ...c, people: [...c.people, ...names].slice(0, LIMITS.maxPeople) }));
    setDraft("");
  };

  const removePerson = (idx: number) =>
    setChart((c) => {
      const people = c.people.filter((_, i) => i !== idx);
      const cells: Record<string, string> = {};
      for (const [k, v] of Object.entries(c.cells)) {
        const [p, d] = k.split("-").map(Number);
        if (p === idx) continue;
        cells[key(p > idx ? p - 1 : p, d)] = v;
      }
      return { ...c, people, cells };
    });

  const autoFill = () => {
    const wheel = loadState();
    const chores = wheel?.items.map((i) => i.name) ?? [];
    let people = chart.people;
    if (people.length === 0 && wheel?.people.length) people = wheel.people.map((p) => p.name);
    if (chores.length === 0 || people.length === 0) {
      toast.push({ message: "Add chores to your wheel and people to the chart first, then auto-fill.", tone: "warn" });
      return;
    }
    // Spread the wheel's chores across the week: each chore lands once, on a
    // random day, for a rotating person, so the load is even.
    const cells: Record<string, string> = {};
    const order = shuffle(chores);
    const slots = shuffle(Array.from({ length: people.length * 7 }, (_, i) => i));
    order.forEach((chore, i) => {
      const slot = slots[i % slots.length];
      const p = slot % people.length;
      const d = Math.floor(slot / people.length);
      const k = key(p, d);
      cells[k] = cells[k] ? `${cells[k]}, ${chore}` : chore;
    });
    setChart((c) => ({ ...c, people, cells }));
    toast.push({ message: `Spread ${chores.length} chores across the week.` });
  };

  const clear = () => {
    const prev = chart;
    setChart((c) => ({ ...c, cells: {} }));
    toast.push({ message: "Chart cleared.", action: { label: "Undo", onClick: () => setChart(prev) } });
  };

  const copy = async () => {
    const lines: string[] = [chart.title || "Weekly chore chart", ""];
    chart.people.forEach((p, pi) => {
      lines.push(p);
      DAYS.forEach((d, di) => {
        const v = chart.cells[key(pi, di)];
        if (v) lines.push(`  ${d}: ${v}`);
      });
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.push({ message: "Chart copied." });
    } catch {
      toast.push({ message: "Couldn't copy automatically.", tone: "warn" });
    }
  };

  const print = () => {
    track({ name: "print_clicked", source: "chart" });
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 text-sm font-medium">
          <span className="mb-1 block">Chart title</span>
          <input
            type="text"
            value={chart.title}
            onChange={(e) => setChart((c) => ({ ...c, title: e.target.value.slice(0, LIMITS.maxNameLength) }))}
            placeholder="e.g. Week of 12 May"
            className="min-h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[16px]"
          />
        </label>
        <form onSubmit={addPerson} className="flex flex-1 gap-2">
          <label htmlFor="chart-person" className="sr-only">
            Add a person
          </label>
          <input
            id="chart-person"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a person"
            className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[16px]"
          />
          <Button type="submit" variant="primary" disabled={!draft.trim()}>
            Add
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={autoFill}>Auto-fill from my wheel</Button>
        <Button onClick={print} disabled={chart.people.length === 0}>
          Print
        </Button>
        <Button onClick={copy} disabled={chart.people.length === 0}>
          Copy
        </Button>
        <Button variant="ghost" onClick={clear} disabled={Object.keys(chart.cells).length === 0}>
          Clear chart
        </Button>
      </div>

      <section aria-label="Weekly chore chart">
        <h2 className="mb-2 text-xl font-bold">{chart.title || "Weekly chore chart"}</h2>
        {chart.people.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface-2 p-5 text-center text-sm text-muted">
            Add at least one person to start the chart. If you&apos;ve used the chore wheel, <em>Auto-fill from my wheel</em> brings your
            people and chores across.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-surface-2 text-left">
                  <th scope="col" className="w-32 px-2 py-2 font-semibold">
                    Person
                  </th>
                  {DAYS.map((d, i) => (
                    <th key={d} scope="col" className="px-2 py-2 font-semibold">
                      <abbr title={DAY_FULL[i]} className="no-underline">
                        {d}
                      </abbr>
                    </th>
                  ))}
                  <th scope="col" className="w-10">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {chart.people.map((p, pi) => (
                  <tr key={`${p}-${pi}`} className="border-t border-line align-top">
                    <th scope="row" className="px-2 py-2 text-left font-medium">
                      {p}
                    </th>
                    {DAYS.map((d, di) => (
                      <td key={d} className="p-1">
                        <textarea
                          value={chart.cells[key(pi, di)] ?? ""}
                          onChange={(e) => setCell(pi, di, e.target.value.slice(0, 300))}
                          aria-label={`${p}, ${DAY_FULL[di]}`}
                          rows={2}
                          className="min-h-11 w-full resize-y rounded border border-transparent bg-transparent px-1.5 py-1 text-sm hover:border-line focus:border-line-strong focus:bg-surface"
                        />
                      </td>
                    ))}
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        aria-label={`Remove ${p}`}
                        onClick={() => removePerson(pi)}
                        className="grid h-10 w-9 place-items-center rounded text-lg text-muted hover:text-danger"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-muted">The chart is saved in this browser automatically. Nothing is uploaded.</p>

      {chart.people.length > 0 ? (
        <PrintPortal>
          <h1>{chart.title || "Weekly chore chart"}</h1>
          <table>
            <thead>
              <tr>
                <th>Person</th>
                {DAY_FULL.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.people.map((p, pi) => (
                <tr key={`${p}-${pi}`}>
                  <th scope="row">{p}</th>
                  {DAYS.map((d, di) => (
                    <td key={d} style={{ whiteSpace: "pre-wrap" }}>
                      {chart.cells[key(pi, di)] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </PrintPortal>
      ) : null}
    </div>
  );
}
