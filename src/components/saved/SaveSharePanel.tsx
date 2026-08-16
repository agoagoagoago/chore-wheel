"use client";

import { useState, type FormEvent } from "react";
import type { Action, WheelState } from "@/lib/wheel/state";
import { deleteSavedWheel, savedWheelsStore, upsertSavedWheel, type SavedWheel } from "@/lib/storage/local";
import { useLocalStore } from "@/lib/storage/store";
import { buildShareUrl, encodeShare, payloadFromState } from "@/lib/share/codec";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { LIMITS } from "@/config/site";

type Props = {
  state: WheelState;
  dispatch: (a: Action) => void;
  canPersist: boolean;
  /** Path the share link should point at (always the canonical tool page). */
  sharePath?: string;
};

export function SaveSharePanel({ state, dispatch, canPersist, sharePath = "/" }: Props) {
  const toast = useToast();
  const saved = useLocalStore(savedWheelsStore);
  const [saveName, setSaveName] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const save = (e: FormEvent) => {
    e.preventDefault();
    const name = saveName.trim() || state.title.trim() || `Wheel ${saved.length + 1}`;
    if (state.items.length === 0) {
      toast.push({ message: "Add some chores before saving.", tone: "warn" });
      return;
    }
    const list = upsertSavedWheel({
      name,
      title: state.title,
      items: state.items.map((i) => ({ name: i.name, choreId: i.choreId })),
      people: state.people.map((p) => p.name),
    });
    setSaveName("");
    toast.push({ message: `Saved “${name}” on this device.` });
    track({ name: "saved_wheel_created", savedCount: list.length });
  };

  const load = (w: SavedWheel) => {
    dispatch({ type: "set-items", items: w.items });
    dispatch({ type: "clear-people" });
    for (const p of w.people) dispatch({ type: "add-person", name: p });
    dispatch({ type: "set-title", title: w.title });
    toast.push({ message: `Loaded “${w.name}”.` });
  };

  const remove = (w: SavedWheel) => {
    deleteSavedWheel(w.id);
    toast.push({ message: `Deleted “${w.name}”.` });
  };

  const makeShareUrl = () => {
    const token = encodeShare(payloadFromState(state));
    return buildShareUrl(window.location.origin, sharePath, token);
  };

  const share = async () => {
    if (state.items.length === 0 && state.people.length === 0) {
      toast.push({ message: "Nothing to share yet.", tone: "warn" });
      return;
    }
    const url = makeShareUrl();
    setShareUrl(url);
    const nav = navigator as Navigator & {
      share?: (d: { url: string; title?: string; text?: string }) => Promise<void>;
      canShare?: (d: { url: string }) => boolean;
    };
    if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ url }))) {
      try {
        await nav.share({ url, title: state.title || "Chore Wheel", text: "Here's our chore wheel" });
        track({ name: "share_created", method: "native" });
        return;
      } catch {
        /* user cancelled or unsupported — fall back to copy */
      }
    }
    await copyLink(url);
  };

  const copyLink = async (url = shareUrl ?? makeShareUrl()) => {
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      toast.push({ message: "Share link copied." });
      track({ name: "share_created", method: "copy" });
    } catch {
      toast.push({ message: "Copy failed — the link is shown below so you can copy it manually.", tone: "warn" });
    }
  };

  return (
    <section aria-labelledby="save-share-heading" className="space-y-4">
      <h2 id="save-share-heading" className="text-lg font-semibold">
        Save &amp; share
      </h2>

      <div className="space-y-2">
        <label htmlFor="wheel-title" className="block text-sm font-semibold">
          Wheel / household name <span className="font-normal text-muted">(optional, shown on printouts)</span>
        </label>
        <input
          id="wheel-title"
          type="text"
          value={state.title}
          onChange={(e) => dispatch({ type: "set-title", title: e.target.value })}
          placeholder="e.g. The Garcia household"
          maxLength={LIMITS.maxNameLength}
          className="min-h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[16px] placeholder:text-muted/70"
        />
      </div>

      <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
        <h3 className="font-semibold">Save this wheel</h3>
        <p className="mt-0.5 text-sm text-muted">
          {canPersist
            ? "Saved wheels stay in this browser only — nothing is uploaded."
            : "Storage is unavailable in this browser (private mode or blocked), so saving is disabled. Sharing still works."}
        </p>
        <form onSubmit={save} className="mt-3 flex gap-2">
          <label htmlFor="save-name" className="sr-only">
            Name for the saved wheel
          </label>
          <input
            id="save-name"
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g. Kids Saturday chores"
            maxLength={LIMITS.maxNameLength}
            disabled={!canPersist}
            className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[16px] placeholder:text-muted/70"
          />
          <Button type="submit" variant="primary" disabled={!canPersist}>
            Save wheel
          </Button>
        </form>
        {saved.length > 0 ? (
          <ul className="mt-3 divide-y divide-line" aria-label="Saved wheels">
            {saved.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{w.name}</p>
                  <p className="text-xs text-muted">
                    {w.items.length} chores{w.people.length ? ` · ${w.people.length} people` : ""} ·{" "}
                    {new Date(w.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" onClick={() => load(w)}>
                  Load
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(w)} aria-label={`Delete saved wheel ${w.name}`}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
        <h3 className="font-semibold">Share this wheel</h3>
        <p className="mt-0.5 text-sm text-muted">The link contains the chores and names themselves — nothing is stored on a server.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" onClick={share}>
            Share wheel
          </Button>
          <Button onClick={() => copyLink()}>Copy link</Button>
        </div>
        {shareUrl ? (
          <div className="mt-3">
            <label htmlFor="share-url" className="sr-only">
              Share link
            </label>
            <input
              id="share-url"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded border border-line bg-surface-2 px-2 py-2 text-xs"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
