"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Action, WheelItem } from "@/lib/wheel/state";
import { LIMITS } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { useToast } from "@/components/ui/Toast";

type Props = {
  items: WheelItem[];
  dispatch: (a: Action) => void;
  disabled?: boolean;
  onOpenTemplates: () => void;
};

export function ChoreEditor({ items, dispatch, disabled, onOpenTemplates }: Props) {
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const atLimit = items.length >= LIMITS.maxChores;

  const add = (e: FormEvent) => {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    if (atLimit) {
      setNotice(`A wheel can hold up to ${LIMITS.maxChores} chores. Remove one to add another.`);
      return;
    }
    // Support pasting a comma- or newline-separated list.
    const parts = name
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      dispatch({ type: "add-items", items: parts.map((p) => ({ name: p })) });
    } else {
      dispatch({ type: "add-item", name });
    }
    track({ name: "chore_added", itemCount: Math.min(LIMITS.maxChores, items.length + parts.length) });
    setDraft("");
    setNotice(null);
    inputRef.current?.focus();
  };

  return (
    <section aria-labelledby="chores-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="chores-heading" className="text-lg font-semibold">
          Chores on the wheel <span className="text-muted font-normal text-sm">({items.length})</span>
        </h2>
        <Button size="sm" variant="ghost" onClick={onOpenTemplates} className="text-accent">
          Use a template
        </Button>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <label htmlFor="new-chore" className="sr-only">
          Add a chore
        </label>
        <input
          ref={inputRef}
          id="new-chore"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a chore, e.g. Clean the litter box"
          maxLength={LIMITS.maxNameLength * 4}
          autoComplete="off"
          enterKeyHint="done"
          className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[16px] placeholder:text-muted/70"
          disabled={disabled}
        />
        <Button type="submit" variant="primary" disabled={disabled || !draft.trim()}>
          Add
        </Button>
      </form>
      {notice ? (
        <p role="status" className="text-sm text-warn">
          {notice}
        </p>
      ) : null}
      {draft.length > LIMITS.maxNameLength && !draft.includes(",") ? (
        <p className="text-sm text-muted">Names are trimmed to {LIMITS.maxNameLength} characters.</p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface-2 p-5 text-center">
          <p className="font-semibold">Your wheel is empty</p>
          <p className="mt-1 text-sm text-muted">Add a chore above or start from a template.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => inputRef.current?.focus()}>
              Add chore
            </Button>
            <Button size="sm" variant="primary" onClick={onOpenTemplates}>
              Use household template
            </Button>
          </div>
        </div>
      ) : (
        <ol className="divide-y divide-line rounded-[var(--radius-md)] border border-line bg-surface" aria-label="Chores on the wheel">
          {items.map((item, i) => (
            <ChoreRow key={item.id} item={item} index={i} total={items.length} dispatch={dispatch} disabled={disabled} />
          ))}
        </ol>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" onClick={() => dispatch({ type: "shuffle-items" })} disabled={disabled || items.length < 2}>
          Shuffle
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: "sort-items" })} disabled={disabled || items.length < 2}>
          Sort A–Z
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            if (items.length === 0) return;
            const snapshot = items.map((i) => ({ name: i.name, choreId: i.choreId }));
            dispatch({ type: "clear-items" });
            toast.push({
              message: "Wheel cleared.",
              action: { label: "Undo", onClick: () => dispatch({ type: "set-items", items: snapshot }) },
            });
          }}
          disabled={disabled || items.length === 0}
        >
          Clear wheel
        </Button>
        <Button size="sm" onClick={() => dispatch({ type: "restore-defaults" })} disabled={disabled}>
          Restore defaults
        </Button>
      </div>
    </section>
  );
}

function ChoreRow({
  item,
  index,
  total,
  dispatch,
  disabled,
}: {
  item: WheelItem;
  index: number;
  total: number;
  dispatch: (a: Action) => void;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name);

  const commit = () => {
    const v = value.trim();
    if (v && v !== item.name) dispatch({ type: "edit-item", id: item.id, name: v });
    else setValue(item.name);
    setEditing(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setValue(item.name);
      setEditing(false);
    }
  };

  return (
    <li className="flex items-center gap-1 px-2 py-1">
      <span className="w-6 shrink-0 text-center text-xs text-muted tabular-nums" aria-hidden="true">
        {index + 1}
      </span>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          maxLength={LIMITS.maxNameLength}
          aria-label={`Edit chore ${index + 1}`}
          autoFocus
          className="min-h-10 min-w-0 flex-1 rounded border border-line-strong px-2 text-[16px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={disabled}
          className="min-h-10 min-w-0 flex-1 truncate rounded px-2 text-left hover:bg-surface-2"
          title="Edit"
        >
          <span className="truncate">{item.name}</span>
          <span className="sr-only"> — edit</span>
        </button>
      )}
      <div className="flex shrink-0 items-center">
        <IconButton
          label={`Move ${item.name} up`}
          disabled={disabled || index === 0}
          onClick={() => dispatch({ type: "move-item", id: item.id, direction: -1 })}
        >
          ↑
        </IconButton>
        <IconButton
          label={`Move ${item.name} down`}
          disabled={disabled || index === total - 1}
          onClick={() => dispatch({ type: "move-item", id: item.id, direction: 1 })}
        >
          ↓
        </IconButton>
        <IconButton
          label={`Remove ${item.name}`}
          disabled={disabled}
          onClick={() => {
            dispatch({ type: "remove-item", id: item.id });
            track({ name: "chore_removed", itemCount: total - 1 });
          }}
          danger
        >
          ×
        </IconButton>
      </div>
    </li>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-10 w-9 place-items-center rounded text-lg leading-none disabled:opacity-30 ${danger ? "text-danger hover:bg-danger-soft" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
    >
      {children}
    </button>
  );
}
