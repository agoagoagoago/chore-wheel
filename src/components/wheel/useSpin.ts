"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { WheelItem } from "@/lib/wheel/state";
import { selectWinner } from "@/lib/wheel/random";
import { targetRotation } from "@/lib/wheel/geometry";
import { randomFloat, randomIndex } from "@/lib/wheel/random";

const SPIN_MS = 3600;

const RM_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

/** Tiny WebAudio "tick" — no asset needed. Only called when sound is on. */
function playTick(kind: "start" | "end") {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = kind === "start" ? 520 : 780;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "start" ? 0.12 : 0.35));
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    /* sound is optional */
  }
}

type Options = {
  reducedMotion: boolean;
  sound: boolean;
  onResult: (item: WheelItem) => void;
};

/**
 * Owns the spin lifecycle. The winner is chosen *before* animation starts,
 * then the wheel animates so the pointer lands on it. `settle()` is called
 * by the wheel's transitionend (with a timeout fallback for hidden tabs).
 */
export function useSpin(items: WheelItem[], { reducedMotion, sound, onResult }: Options) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [result, setResult] = useState<WheelItem | null>(null);
  const pending = useRef<WheelItem | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settledRef = useRef(false);

  const finish = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    if (fallback.current) clearTimeout(fallback.current);
    const item = pending.current;
    pending.current = null;
    setSpinning(false);
    if (item) {
      setResult(item);
      if (sound) playTick("end");
      onResult(item);
    }
  }, [onResult, sound]);

  const spin = useCallback(() => {
    if (spinning || items.length === 0) return false;
    const winner = selectWinner(items);
    if (!winner) return false;
    settledRef.current = false;
    pending.current = winner.item;
    setResult(null);
    setSpinning(true);
    if (sound) playTick("start");

    if (reducedMotion) {
      // Instant selection: snap the wheel and announce.
      setAnimate(false);
      setRotation((r) => targetRotation(r, winner.index, items.length, 0, randomFloat()));
      fallback.current = setTimeout(finish, 50);
      return true;
    }
    setAnimate(true);
    const turns = 4 + randomIndex(3); // 4–6 full turns
    setRotation((r) => targetRotation(r, winner.index, items.length, turns, randomFloat()));
    fallback.current = setTimeout(finish, SPIN_MS + 400);
    return true;
  }, [finish, items, reducedMotion, sound, spinning]);

  const settle = useCallback(() => {
    if (pending.current) finish();
  }, [finish]);

  const clearResult = useCallback(() => setResult(null), []);

  useEffect(
    () => () => {
      if (fallback.current) clearTimeout(fallback.current);
    },
    [],
  );

  // If the result item was removed from the wheel, keep showing the result text
  // (it's the announcement) — nothing to do here. Rotation stays put.

  return { rotation, spinning, animate, result, spin, settle, clearResult };
}
