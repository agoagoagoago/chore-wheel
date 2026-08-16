"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WheelItem, WheelState } from "@/lib/wheel/state";
import { getChores } from "@/lib/chores/data";
import { getTemplate, templateChores } from "@/lib/chores/templates";
import type { Template } from "@/lib/chores/types";
import { decodeShare, parseHash } from "@/lib/share/codec";
import { takePendingAdd } from "@/lib/storage/local";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { WheelSvg } from "./WheelSvg";
import { WheelResult } from "./WheelResult";
import { ChoreEditor } from "./ChoreEditor";
import { SpinHistory } from "./SpinHistory";
import { WheelOptions } from "./WheelOptions";
import { useWheelState } from "./useWheelState";
import { usePrefersReducedMotion, useSpin } from "./useSpin";
import { TemplatePicker } from "@/components/templates/TemplatePicker";
import { AssignmentPanel } from "@/components/assignments/AssignmentPanel";
import { PrintSheet } from "@/components/assignments/PrintSheet";
import { SaveSharePanel } from "@/components/saved/SaveSharePanel";

export type ChoreWheelAppProps = {
  /** Template to preload on landing pages (kids, family, roommates). */
  presetTemplateId?: string;
  /** Which panel opens first. */
  defaultTab?: Tab;
  /** Where share links point. Always the canonical tool page. */
  sharePath?: string;
};

type Tab = "chores" | "assign" | "save";

const TABS: { id: Tab; label: string; short?: string }[] = [
  { id: "chores", label: "Chores" },
  { id: "assign", label: "Assign to people", short: "Assign" },
  { id: "save", label: "Save & share", short: "Save & share" },
];

export function ChoreWheelApp(props: ChoreWheelAppProps) {
  return (
    <ToastProvider>
      <App {...props} />
    </ToastProvider>
  );
}

function App({ presetTemplateId, defaultTab = "chores", sharePath = "/" }: ChoreWheelAppProps) {
  const { state, dispatch, replace, getState, hydrated, canPersist } = useWheelState();
  const toast = useToast();
  const reducedMotion = usePrefersReducedMotion();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [presetOffer, setPresetOffer] = useState<Template | null>(null);

  const onResult = useCallback(
    (item: WheelItem) => {
      dispatch({ type: "record-spin", item });
    },
    [dispatch],
  );

  const { rotation, spinning, animate, result, spin, settle, clearResult } = useSpin(state.items, {
    reducedMotion,
    sound: state.options.sound,
    onResult,
  });

  const doSpin = () => {
    if (spin()) track({ name: "wheel_spin", itemCount: state.items.length, fair: state.options.fairRotation });
  };

  /* ---- URL hash / hand-off handling (after hydration, and on hashchange) -- */
  useEffect(() => {
    if (!hydrated) return;
    const handleHash = (isInitial: boolean) => {
      const state = getState();
      const { share, add, template } = parseHash(window.location.hash);
      let handled = false;

      if (share) {
        const payload = decodeShare(share);
        if (payload) {
          const previous: WheelState = state;
          dispatch({ type: "set-items", items: payload.items });
          dispatch({ type: "clear-people" });
          for (const p of payload.people) dispatch({ type: "add-person", name: p });
          dispatch({ type: "set-title", title: payload.title });
          dispatch({ type: "set-option", key: "removeAfterSpin", value: payload.options.removeAfterSpin });
          dispatch({ type: "set-option", key: "fairRotation", value: payload.options.fairRotation });
          toast.push({ message: "Loaded a shared wheel.", action: { label: "Undo", onClick: () => replace(previous) } });
          setTab(payload.people.length && payload.items.length ? "assign" : "chores");
        } else {
          toast.push({ message: "That share link couldn't be read, so your own wheel is shown instead.", tone: "warn" });
        }
        handled = true;
      }

      const pendingIds = [...(add ?? []), ...takePendingAdd()];
      if (pendingIds.length) {
        const chores = getChores(Array.from(new Set(pendingIds)));
        const before = state.items.length;
        dispatch({ type: "add-items", items: chores.map((c) => ({ name: c.name, choreId: c.id })) });
        toast.push({ message: `Added ${chores.length} chore${chores.length === 1 ? "" : "s"} to your wheel.` });
        track({ name: "library_add_to_wheel", itemCount: before + chores.length });
        handled = true;
      }

      if (template && !handled) {
        const t = getTemplate(template);
        if (t) {
          dispatch({ type: "set-items", items: templateChores(t).map((c) => ({ name: c.name, choreId: c.id })), templateId: t.id });
          toast.push({ message: `Loaded “${t.name}”.${t.note ? " " + t.note : ""}` });
          track({ name: "template_selected", templateId: t.id });
          handled = true;
        }
      }

      if (handled) {
        // Drop the hash so a refresh doesn't re-apply it and the URL stays clean.
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        return;
      }

      if (presetTemplateId && isInitial) {
        const t = getTemplate(presetTemplateId);
        if (t && state.templateId !== t.id) {
          const untouched = state.templateId !== null || state.items.length === 0;
          if (untouched) {
            dispatch({ type: "set-items", items: templateChores(t).map((c) => ({ name: c.name, choreId: c.id })), templateId: t.id });
          } else {
            setPresetOffer(t);
          }
        }
      }
    };
    handleHash(true);
    const onChange = () => handleHash(false);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
    // Runs once after hydration; later changes arrive via hashchange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const pickTemplate = (t: Template, mode: "replace" | "add") => {
    const items = templateChores(t).map((c) => ({ name: c.name, choreId: c.id }));
    if (mode === "replace") {
      const previous = state.items.map((i) => ({ name: i.name, choreId: i.choreId }));
      const prevTemplate = state.templateId;
      dispatch({ type: "set-items", items, templateId: t.id });
      toast.push({
        message: `Loaded “${t.name}”.${t.note ? " " + t.note : ""}`,
        action: previous.length
          ? { label: "Undo", onClick: () => dispatch({ type: "set-items", items: previous, templateId: prevTemplate }) }
          : undefined,
      });
    } else {
      dispatch({ type: "add-items", items });
      toast.push({ message: `Added “${t.name}” chores.` });
    }
    track({ name: "template_selected", templateId: t.id });
    setTemplatesOpen(false);
    clearResult();
  };

  const wheelSummary = useMemo(() => {
    if (state.items.length === 0) return "The wheel is empty.";
    const names = state.items.map((i) => i.name);
    return `Wheel with ${names.length} chore${names.length === 1 ? "" : "s"}: ${names.join(", ")}.`;
  }, [state.items]);

  const resultStillOnWheel = Boolean(result && state.items.some((i) => i.id === result.id));

  return (
    <div id="chore-wheel-app" className="grid scroll-mt-4 gap-8 lg:grid-cols-2 lg:gap-12" data-hydrated={hydrated ? "true" : "false"}>
      {/* ---------------- Wheel column ---------------- */}
      <div className="min-w-0 space-y-4">
        <div className="relative">
          <WheelSvg
            items={state.items}
            rotation={rotation}
            animate={animate && !reducedMotion}
            onSettled={settle}
            highlightId={!spinning && result ? result.id : null}
          />
          <p className="sr-only">{wheelSummary}</p>
        </div>
        <div className="mx-auto max-w-[480px]">
          <Button
            variant="primary"
            size="lg"
            onClick={doSpin}
            disabled={spinning || state.items.length === 0}
            aria-disabled={spinning || state.items.length === 0}
            className="w-full"
            data-testid="spin-button"
          >
            {spinning ? "Spinning…" : state.items.length === 0 ? "Add chores to spin" : result ? "Spin again" : "Spin the wheel"}
          </Button>
          <div className="mt-4">
            <WheelResult
              result={result}
              spinning={spinning}
              itemCount={state.items.length}
              onSpinAgain={doSpin}
              stillOnWheel={resultStillOnWheel}
              onMarkDone={(item) => {
                dispatch({ type: "mark-done", item });
                toast.push({ message: `Nice — “${item.name}” marked done and taken off the wheel.` });
              }}
              onRemove={(item) => dispatch({ type: "remove-item", id: item.id })}
            />
          </div>
          <div className="mt-4">
            <SpinHistory history={state.history} doneToday={state.doneToday} onClear={() => dispatch({ type: "clear-history" })} />
          </div>
        </div>
      </div>

      {/* ---------------- Controls column ---------------- */}
      <div className="min-w-0 space-y-4">
        {presetOffer ? (
          <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-accent/40 bg-accent-soft px-4 py-3 text-sm">
            <span className="flex-1">
              You have a customised wheel. Load the <strong>{presetOffer.name}</strong> template instead?
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                pickTemplate(presetOffer, "replace");
                setPresetOffer(null);
              }}
            >
              Load template
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPresetOffer(null)}>
              Keep mine
            </Button>
          </div>
        ) : null}

        <div role="tablist" aria-label="Wheel controls" className="grid grid-cols-3 gap-1 rounded-[var(--radius-md)] bg-surface-2 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-label={t.label}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                const idx = TABS.findIndex((x) => x.id === tab);
                if (e.key === "ArrowRight") setTab(TABS[(idx + 1) % TABS.length].id);
                if (e.key === "ArrowLeft") setTab(TABS[(idx - 1 + TABS.length) % TABS.length].id);
              }}
              className={`min-h-11 rounded-[var(--radius-sm)] px-2 text-sm font-medium transition-colors sm:text-[0.95rem] ${
                tab === t.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              <span className="sm:hidden">{t.short ?? t.label}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div id="panel-chores" role="tabpanel" aria-labelledby="tab-chores" hidden={tab !== "chores"} className="space-y-4">
          <ChoreEditor items={state.items} dispatch={dispatch} disabled={spinning} onOpenTemplates={() => setTemplatesOpen((o) => !o)} />
          <TemplatePicker
            open={templatesOpen}
            onClose={() => setTemplatesOpen(false)}
            onPick={pickTemplate}
            currentTemplateId={state.templateId}
          />
          <WheelOptions options={state.options} onChange={(k, v) => dispatch({ type: "set-option", key: k, value: v })} />
        </div>

        <div id="panel-assign" role="tabpanel" aria-labelledby="tab-assign" hidden={tab !== "assign"}>
          <AssignmentPanel state={state} dispatch={dispatch} />
        </div>

        <div id="panel-save" role="tabpanel" aria-labelledby="tab-save" hidden={tab !== "save"}>
          <SaveSharePanel state={state} dispatch={dispatch} canPersist={canPersist} sharePath={sharePath} />
        </div>
      </div>

      <PrintSheet title={state.title} assignments={state.assignments} />
    </div>
  );
}
