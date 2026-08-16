import { LIMITS } from "@/config/site";
import { DEFAULT_WHEEL_IDS, getChores } from "@/lib/chores/data";
import { shuffle } from "./random";

export type WheelItem = {
  /** Local unique id (not the library id). */
  id: string;
  name: string;
  /** Library chore id when the item came from the canonical library. */
  choreId?: string;
};

export type Person = { id: string; name: string };

export type WheelOptions = {
  removeAfterSpin: boolean;
  sound: boolean;
  fairRotation: boolean;
};

export type SpinRecord = { id: string; name: string; at: number };

export type Assignment = { person: Person; item: WheelItem | null };

/** Compact record used by Fair Rotation. Names, not ids, so history survives edits. */
export type AssignmentRecord = { person: string; chore: string; at: number };

export type WheelState = {
  version: 1;
  title: string;
  items: WheelItem[];
  people: Person[];
  options: WheelOptions;
  history: SpinRecord[];
  doneToday: SpinRecord[];
  assignments: Assignment[] | null;
  assignmentHistory: AssignmentRecord[];
  /** Id of the last loaded template, purely informational. */
  templateId: string | null;
};

let counter = 0;
export const uid = () => {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
};

export const cleanName = (raw: string) =>
  // Strip control characters, collapse whitespace, cap length.
  raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LIMITS.maxNameLength);

export const makeItem = (name: string, choreId?: string): WheelItem => ({ id: uid(), name: cleanName(name), choreId });

export const defaultOptions = (): WheelOptions => ({ removeAfterSpin: false, sound: false, fairRotation: false });

export const defaultItems = () => getChores(DEFAULT_WHEEL_IDS).map((c) => makeItem(c.name, c.id));

export const defaultPeople = () => ["Alex", "Jamie", "Sam", "Taylor"].map((n) => ({ id: uid(), name: n }));

export const initialState = (): WheelState => ({
  version: 1,
  title: "",
  items: defaultItems(),
  people: defaultPeople(),
  options: defaultOptions(),
  history: [],
  doneToday: [],
  assignments: null,
  assignmentHistory: [],
  templateId: "everyday",
});

export type Action =
  | { type: "hydrate"; state: WheelState }
  | { type: "add-item"; name: string; choreId?: string }
  | { type: "add-items"; items: { name: string; choreId?: string }[] }
  | { type: "edit-item"; id: string; name: string }
  | { type: "remove-item"; id: string }
  | { type: "move-item"; id: string; direction: -1 | 1 }
  | { type: "reorder-items"; ids: string[] }
  | { type: "set-items"; items: { name: string; choreId?: string }[]; templateId?: string | null }
  | { type: "clear-items" }
  | { type: "restore-defaults" }
  | { type: "shuffle-items" }
  | { type: "sort-items" }
  | { type: "set-title"; title: string }
  | { type: "add-person"; name: string }
  | { type: "edit-person"; id: string; name: string }
  | { type: "remove-person"; id: string }
  | { type: "clear-people" }
  | { type: "set-option"; key: keyof WheelOptions; value: boolean }
  | { type: "record-spin"; item: WheelItem }
  | { type: "mark-done"; item: WheelItem }
  | { type: "clear-history" }
  | { type: "set-assignments"; assignments: Assignment[] | null }
  | { type: "record-assignments"; assignments: Assignment[]; at?: number }
  | { type: "clear-assignment-history" };

const MAX_ASSIGNMENT_HISTORY = 200;

const isToday = (ts: number, now: number) => new Date(ts).toDateString() === new Date(now).toDateString();

export function reducer(state: WheelState, action: Action): WheelState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "add-item": {
      const name = cleanName(action.name);
      if (!name || state.items.length >= LIMITS.maxChores) return state;
      return { ...state, items: [...state.items, makeItem(name, action.choreId)], templateId: null };
    }

    case "add-items": {
      const existingChoreIds = new Set(state.items.map((i) => i.choreId).filter(Boolean));
      const existingNames = new Set(state.items.map((i) => i.name.toLowerCase()));
      const next = [...state.items];
      for (const raw of action.items) {
        if (next.length >= LIMITS.maxChores) break;
        const name = cleanName(raw.name);
        if (!name) continue;
        if (raw.choreId && existingChoreIds.has(raw.choreId)) continue;
        if (existingNames.has(name.toLowerCase())) continue;
        next.push(makeItem(name, raw.choreId));
        if (raw.choreId) existingChoreIds.add(raw.choreId);
        existingNames.add(name.toLowerCase());
      }
      if (next.length === state.items.length) return state;
      return { ...state, items: next, templateId: null };
    }

    case "edit-item": {
      const name = cleanName(action.name);
      if (!name) return state;
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, name, choreId: undefined } : i)),
      };
    }

    case "remove-item":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "move-item": {
      const idx = state.items.findIndex((i) => i.id === action.id);
      const to = idx + action.direction;
      if (idx < 0 || to < 0 || to >= state.items.length) return state;
      const items = state.items.slice();
      [items[idx], items[to]] = [items[to], items[idx]];
      return { ...state, items };
    }

    case "reorder-items": {
      const map = new Map(state.items.map((i) => [i.id, i]));
      const items = action.ids.map((id) => map.get(id)).filter((i): i is WheelItem => Boolean(i));
      if (items.length !== state.items.length) return state;
      return { ...state, items };
    }

    case "set-items": {
      const items = action.items
        .map((i) => makeItem(i.name, i.choreId))
        .filter((i) => i.name)
        .slice(0, LIMITS.maxChores);
      return { ...state, items, templateId: action.templateId ?? null, assignments: null };
    }

    case "clear-items":
      return { ...state, items: [], templateId: null, assignments: null };

    case "restore-defaults":
      return { ...state, items: defaultItems(), templateId: "everyday", assignments: null };

    case "shuffle-items":
      return { ...state, items: shuffle(state.items) };

    case "sort-items":
      return { ...state, items: state.items.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })) };

    case "set-title":
      return { ...state, title: cleanName(action.title) };

    case "add-person": {
      const name = cleanName(action.name);
      if (!name || state.people.length >= LIMITS.maxPeople) return state;
      return { ...state, people: [...state.people, { id: uid(), name }] };
    }

    case "edit-person": {
      const name = cleanName(action.name);
      if (!name) return state;
      return { ...state, people: state.people.map((p) => (p.id === action.id ? { ...p, name } : p)) };
    }

    case "remove-person":
      return {
        ...state,
        people: state.people.filter((p) => p.id !== action.id),
        assignments: state.assignments ? state.assignments.filter((a) => a.person.id !== action.id) : null,
      };

    case "clear-people":
      return { ...state, people: [], assignments: null };

    case "set-option":
      return { ...state, options: { ...state.options, [action.key]: action.value } };

    case "record-spin": {
      const record: SpinRecord = { id: action.item.id, name: action.item.name, at: Date.now() };
      const history = [record, ...state.history].slice(0, LIMITS.maxHistory);
      const items = state.options.removeAfterSpin ? state.items.filter((i) => i.id !== action.item.id) : state.items;
      return { ...state, history, items };
    }

    case "mark-done": {
      const now = Date.now();
      const record: SpinRecord = { id: action.item.id, name: action.item.name, at: now };
      const doneToday = [record, ...state.doneToday.filter((d) => isToday(d.at, now))].slice(0, LIMITS.maxHistory);
      return { ...state, doneToday, items: state.items.filter((i) => i.id !== action.item.id) };
    }

    case "clear-history":
      return { ...state, history: [], doneToday: [] };

    case "set-assignments":
      return { ...state, assignments: action.assignments };

    case "record-assignments": {
      const at = action.at ?? Date.now();
      const records: AssignmentRecord[] = action.assignments
        .filter((a) => a.item)
        .map((a) => ({ person: a.person.name, chore: (a.item as WheelItem).name, at }));
      const assignmentHistory = [...records, ...state.assignmentHistory].slice(0, MAX_ASSIGNMENT_HISTORY);
      return { ...state, assignmentHistory, assignments: action.assignments };
    }

    case "clear-assignment-history":
      return { ...state, assignmentHistory: [] };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------------ */
/* Validation of untrusted state (localStorage / share URLs)                */
/* ------------------------------------------------------------------------ */

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown, max: number = LIMITS.maxNameLength): string | null => (typeof v === "string" ? cleanName(v).slice(0, max) : null);

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

const parseItems = (v: unknown): WheelItem[] => {
  if (!Array.isArray(v)) return [];
  const out: WheelItem[] = [];
  for (const raw of v.slice(0, LIMITS.maxChores)) {
    if (isRecord(raw)) {
      const name = str(raw.name);
      if (!name) continue;
      const choreId = typeof raw.choreId === "string" && /^[a-z0-9-]{1,40}$/.test(raw.choreId) ? raw.choreId : undefined;
      out.push({ id: uid(), name, choreId });
    } else if (typeof raw === "string") {
      const name = str(raw);
      if (name) out.push({ id: uid(), name });
    }
  }
  return out;
};

const parsePeople = (v: unknown): Person[] => {
  if (!Array.isArray(v)) return [];
  const out: Person[] = [];
  for (const raw of v.slice(0, LIMITS.maxPeople)) {
    const name = isRecord(raw) ? str(raw.name) : str(raw);
    if (name) out.push({ id: uid(), name });
  }
  return out;
};

const parseRecords = (v: unknown, max: number): SpinRecord[] => {
  if (!Array.isArray(v)) return [];
  const out: SpinRecord[] = [];
  for (const raw of v.slice(0, max)) {
    if (!isRecord(raw)) continue;
    const name = str(raw.name);
    const at = num(raw.at);
    if (name && at !== null) out.push({ id: uid(), name, at });
  }
  return out;
};

const parseAssignmentHistory = (v: unknown): AssignmentRecord[] => {
  if (!Array.isArray(v)) return [];
  const out: AssignmentRecord[] = [];
  for (const raw of v.slice(0, MAX_ASSIGNMENT_HISTORY)) {
    if (!isRecord(raw)) continue;
    const person = str(raw.person);
    const chore = str(raw.chore);
    const at = num(raw.at);
    if (person && chore && at !== null) out.push({ person, chore, at });
  }
  return out;
};

/**
 * Turn arbitrary untrusted JSON into a valid WheelState. Anything unexpected
 * is dropped or replaced with defaults; this never throws.
 */
export function normalizeState(input: unknown, base: WheelState = initialState()): WheelState {
  if (!isRecord(input)) return base;
  const opts = isRecord(input.options) ? input.options : {};
  const items = "items" in input ? parseItems(input.items) : base.items;
  return {
    version: 1,
    title: str(input.title, 80) ?? "",
    items,
    people: "people" in input ? parsePeople(input.people) : base.people,
    options: {
      removeAfterSpin: typeof opts.removeAfterSpin === "boolean" ? opts.removeAfterSpin : false,
      sound: typeof opts.sound === "boolean" ? opts.sound : false,
      fairRotation: typeof opts.fairRotation === "boolean" ? opts.fairRotation : false,
    },
    history: parseRecords(input.history, LIMITS.maxHistory),
    doneToday: parseRecords(input.doneToday, LIMITS.maxHistory),
    assignments: null,
    assignmentHistory: parseAssignmentHistory(input.assignmentHistory),
    templateId: typeof input.templateId === "string" && /^[a-z0-9-]{1,40}$/.test(input.templateId) ? input.templateId : null,
  };
}
