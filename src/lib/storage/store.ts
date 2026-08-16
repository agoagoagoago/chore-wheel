import { useSyncExternalStore } from "react";
import { readJson, storageAvailable, writeJson } from "./primitives";

/**
 * A tiny external store backed by localStorage, designed for
 * `useSyncExternalStore`:
 *
 * - On the server (and during hydration) the snapshot is a fixed default, so
 *   server and client markup match.
 * - On the client the saved value is loaded lazily on first read, then kept in
 *   memory; writes happen synchronously (payloads are a few KB, and a debounce
 *   would lose the last edit on a quick reload/close) and never throw.
 * - `normalize` turns untrusted JSON into a valid value (never throws).
 */
export type LocalStore<T> = {
  get: () => T;
  getServerSnapshot: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  /** True once the client has attempted to load from storage. */
  isLoaded: () => boolean;
  /** Whether localStorage is usable in this browser (false until loaded on client). */
  canPersist: () => boolean;
};

export function createLocalStore<T>(
  key: string,
  defaults: () => T,
  normalize: (raw: unknown, base: T) => T,
  options: { persist?: (value: T) => unknown } = {},
): LocalStore<T> {
  const serverSnapshot = defaults();
  let state: T = serverSnapshot;
  let loaded = false;
  let persistOk = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    persistOk = storageAvailable();
    if (persistOk) {
      const raw = readJson<unknown>(key);
      if (raw !== null) state = normalize(raw, defaults());
      else state = defaults();
    } else {
      state = defaults();
    }
  };

  const persist = () => {
    if (!persistOk) return;
    writeJson(key, options.persist ? options.persist(state) : state);
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    get: () => {
      load();
      return state;
    },
    getServerSnapshot: () => serverSnapshot,
    set: (next) => {
      load();
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      persist();
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isLoaded: () => loaded,
    canPersist: () => persistOk,
  };
}

/** React binding. Returns the store value; server/hydration renders see the defaults. */
export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}

const noop = () => () => {};

/** False during SSR/hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Whether persistence works; reads the flag from the store after hydration. */
export function useCanPersist<T>(store: LocalStore<T>): boolean {
  return useSyncExternalStore(
    store.subscribe,
    () => {
      store.get();
      return store.canPersist();
    },
    () => true,
  );
}
