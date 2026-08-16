import { LIMITS } from "@/config/site";
import { initialState, normalizeState, type WheelState, cleanName, uid } from "@/lib/wheel/state";
import { createLocalStore } from "./store";
import { readJson, remove, writeJson } from "./primitives";

export { readJson, writeJson, remove, storageAvailable } from "./primitives";

/** Persistence layer: storage keys, wheel/saved-wheel stores, and hand-off helpers. */

export const KEYS = {
  state: "chorewheel:v1:state",
  saved: "chorewheel:v1:saved",
  pendingAdd: "chorewheel:v1:pending-add",
  chart: "chorewheel:v1:chart",
} as const;

/* ---- Wheel state --------------------------------------------------------- */

export const loadState = (): WheelState | null => {
  const raw = readJson<unknown>(KEYS.state);
  return raw ? normalizeState(raw) : null;
};

/** Live wheel state store (see lib/storage/store.ts). Assignments are transient and not persisted. */
export const wheelStore = createLocalStore<WheelState>(KEYS.state, initialState, (raw) => normalizeState(raw), {
  persist: (state) => {
    const { assignments: _omit, ...rest } = state;
    void _omit;
    return rest;
  },
});

export const saveState = (state: WheelState) => {
  // Don't persist transient assignments table; recompute on demand.
  const { assignments: _omit, ...rest } = state;
  void _omit;
  return writeJson(KEYS.state, rest);
};

/* ---- Named saved wheels -------------------------------------------------- */

export type SavedWheel = {
  id: string;
  name: string;
  savedAt: number;
  items: { name: string; choreId?: string }[];
  people: string[];
  title: string;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function normalizeSavedWheels(raw: unknown): SavedWheel[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedWheel[] = [];
  for (const w of raw.slice(0, LIMITS.maxSavedWheels)) {
    if (!isRecord(w)) continue;
    const name = typeof w.name === "string" ? cleanName(w.name) : "";
    if (!name) continue;
    const items = Array.isArray(w.items)
      ? w.items
          .slice(0, LIMITS.maxChores)
          .map((i: unknown) => {
            if (typeof i === "string") return { name: cleanName(i) };
            if (isRecord(i) && typeof i.name === "string")
              return { name: cleanName(i.name), choreId: typeof i.choreId === "string" ? i.choreId : undefined };
            return null;
          })
          .filter((i): i is { name: string; choreId?: string } => Boolean(i && i.name))
      : [];
    const people = Array.isArray(w.people)
      ? w.people
          .slice(0, LIMITS.maxPeople)
          .map((p: unknown) => (typeof p === "string" ? cleanName(p) : ""))
          .filter(Boolean)
      : [];
    out.push({
      id: typeof w.id === "string" ? w.id : uid(),
      name,
      savedAt: typeof w.savedAt === "number" ? w.savedAt : Date.now(),
      items,
      people,
      title: typeof w.title === "string" ? cleanName(w.title) : "",
    });
  }
  return out;
}

export const savedWheelsStore = createLocalStore<SavedWheel[]>(
  KEYS.saved,
  () => [],
  (raw) => normalizeSavedWheels(raw),
);

export function upsertSavedWheel(wheel: Omit<SavedWheel, "id" | "savedAt"> & { id?: string }): SavedWheel[] {
  const list = savedWheelsStore.get().slice();
  const existingIdx = wheel.id
    ? list.findIndex((w) => w.id === wheel.id)
    : list.findIndex((w) => w.name.toLowerCase() === wheel.name.toLowerCase());
  const entry: SavedWheel = { ...wheel, id: wheel.id ?? (existingIdx >= 0 ? list[existingIdx].id : uid()), savedAt: Date.now() };
  if (existingIdx >= 0) list[existingIdx] = entry;
  else list.unshift(entry);
  const trimmed = list.slice(0, LIMITS.maxSavedWheels);
  savedWheelsStore.set(trimmed);
  return trimmed;
}

export function deleteSavedWheel(id: string): SavedWheel[] {
  const list = savedWheelsStore.get().filter((w) => w.id !== id);
  savedWheelsStore.set(list);
  return list;
}

/* ---- Pending "add these chores" hand-off from library pages -------------- */

export function setPendingAdd(choreIds: string[]) {
  writeJson(KEYS.pendingAdd, choreIds.slice(0, LIMITS.maxChores));
}

export function takePendingAdd(): string[] {
  const raw = readJson<unknown>(KEYS.pendingAdd);
  remove(KEYS.pendingAdd);
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === "string" && /^[a-z0-9-]{1,40}$/.test(s));
}
