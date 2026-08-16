"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Action, WheelState } from "@/lib/wheel/state";
import { assignChores, assignmentsToCsv, formatAssignments, rerollOne } from "@/lib/assign/assign";
import { LIMITS } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { AssignmentTable } from "./AssignmentTable";

type Props = {
  state: WheelState;
  dispatch: (a: Action) => void;
};

export function AssignmentPanel({ state, dispatch }: Props) {
  const toast = useToast();
  const [draft, setDraft] = useState("");
  const { people, items, assignments, options, assignmentHistory, title } = state;

  const addPerson = (e: FormEvent) => {
    e.preventDefault();
    const parts = draft
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    if (people.length >= LIMITS.maxPeople) {
      toast.push({ message: `You can add up to ${LIMITS.maxPeople} people.`, tone: "warn" });
      return;
    }
    for (const p of parts) dispatch({ type: "add-person", name: p });
    setDraft("");
  };

  const generate = () => {
    if (people.length === 0 || items.length === 0) return;
    const next = assignChores(people, items, { fair: options.fairRotation, history: assignmentHistory });
    dispatch({ type: "record-assignments", assignments: next });
    track({ name: "assignment_generated", peopleCount: people.length, itemCount: items.length, fair: options.fairRotation });
  };

  const reroll = (rowIndex: number) => {
    if (!assignments) return;
    const next = rerollOne(assignments, rowIndex, items, { fair: options.fairRotation, history: assignmentHistory });
    dispatch({ type: "set-assignments", assignments: next });
  };

  const copy = async () => {
    if (!assignments) return;
    const text = formatAssignments(assignments, title);
    try {
      await navigator.clipboard.writeText(text);
      toast.push({ message: "Assignments copied." });
    } catch {
      toast.push({ message: "Couldn't copy automatically — select the table and copy manually.", tone: "warn" });
    }
  };

  const downloadCsv = () => {
    if (!assignments) return;
    const blob = new Blob([assignmentsToCsv(assignments)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chore-assignments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const print = () => {
    track({ name: "print_clicked", source: "assignments" });
    window.print();
  };

  const canGenerate = people.length > 0 && items.length > 0;

  return (
    <section aria-labelledby="assign-heading" className="space-y-4">
      <div>
        <h2 id="assign-heading" className="text-lg font-semibold">
          Who does what?
        </h2>
        <p className="text-sm text-muted">Add the people in your household, then assign the chores on the wheel at random.</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">
          People <span className="font-normal text-muted">({people.length})</span>
        </h3>
        <form onSubmit={addPerson} className="flex gap-2">
          <label htmlFor="new-person" className="sr-only">
            Add a person
          </label>
          <input
            id="new-person"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a name (or several, comma separated)"
            maxLength={LIMITS.maxNameLength * 4}
            autoComplete="off"
            enterKeyHint="done"
            className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[16px] placeholder:text-muted/70"
          />
          <Button type="submit" variant="primary" disabled={!draft.trim()}>
            Add
          </Button>
        </form>
        {people.length === 0 ? (
          <p className="rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-surface-2 px-3 py-3 text-sm text-muted">
            No people yet. Add at least one name to assign chores.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="People">
            {people.map((p, i) => (
              <PersonChip
                key={p.id}
                index={i}
                name={p.name}
                onRename={(n) => dispatch({ type: "edit-person", id: p.id, name: n })}
                onRemove={() => dispatch({ type: "remove-person", id: p.id })}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[var(--radius-md)] border border-line bg-surface px-4 py-1">
        <Toggle
          id="assign-fair"
          checked={options.fairRotation}
          onChange={(v) => {
            dispatch({ type: "set-option", key: "fairRotation", value: v });
            track({ name: "fair_rotation_enabled", enabled: v });
          }}
          label="Fair Rotation"
          description={
            assignmentHistory.length
              ? `Uses ${assignmentHistory.length} recent assignments saved on this device to spread chores around.`
              : "Remembers who got what (on this device only) so repeat assignments are avoided when possible."
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="lg" onClick={generate} disabled={!canGenerate} className="flex-1 sm:flex-none">
          {assignments ? "Reassign everything" : "Assign chores"}
        </Button>
        {!canGenerate ? (
          <p className="self-center text-sm text-muted">{people.length === 0 ? "Add people first." : "Add chores to the wheel first."}</p>
        ) : null}
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="space-y-3">
          <AssignmentTable assignments={assignments} onReroll={reroll} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={copy}>
              Copy assignments
            </Button>
            <Button size="sm" onClick={print}>
              Print
            </Button>
            <Button size="sm" onClick={downloadCsv}>
              Download CSV
            </Button>
          </div>
          {assignmentHistory.length > 0 ? (
            <p className="text-xs text-muted">
              Assignment history is stored only in this browser.{" "}
              <button type="button" className="underline underline-offset-2" onClick={() => dispatch({ type: "clear-assignment-history" })}>
                Clear history
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PersonChip({
  index,
  name,
  onRename,
  onRemove,
}: {
  index: number;
  name: string;
  onRename: (n: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const commit = () => {
    const v = value.trim();
    if (v && v !== name) onRename(v);
    else setValue(name);
    setEditing(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setValue(name);
      setEditing(false);
    }
  };
  return (
    <li className="flex items-center rounded-full border border-line-strong bg-surface pl-1">
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          maxLength={LIMITS.maxNameLength}
          aria-label={`Edit person ${index + 1}`}
          autoFocus
          className="min-h-9 w-32 rounded-full px-2 text-[16px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-10 max-w-[12rem] truncate px-3 text-[0.95rem] font-medium"
          title="Edit name"
        >
          {name}
          <span className="sr-only"> — edit</span>
        </button>
      )}
      <button
        type="button"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        className="grid h-10 w-9 place-items-center rounded-full text-lg text-muted hover:text-danger"
      >
        ×
      </button>
    </li>
  );
}
