"use client";

import { useCallback } from "react";
import { reducer, type Action, type WheelState } from "@/lib/wheel/state";
import { wheelStore } from "@/lib/storage/local";
import { useCanPersist, useHydrated, useLocalStore } from "@/lib/storage/store";

/**
 * Wheel state bound to the persisted external store.
 * - Server and hydration renders see deterministic defaults so markup matches;
 *   the saved state is swapped in right after hydration.
 * - Writes happen inside the store and never throw.
 */
export function useWheelState() {
  const state = useLocalStore(wheelStore);
  const hydrated = useHydrated();
  const canPersist = useCanPersist(wheelStore);

  const dispatch = useCallback((action: Action) => wheelStore.set((prev) => reducer(prev, action)), []);
  const replace = useCallback((next: WheelState) => wheelStore.set(next), []);
  /** Read the latest state outside render (event handlers, effects). */
  const getState = useCallback(() => wheelStore.get(), []);

  return { state, dispatch, replace, getState, hydrated, canPersist };
}
