import type { Assignment, AssignmentRecord, Person, WheelItem } from "@/lib/wheel/state";
import { randomFloat, shuffle } from "@/lib/wheel/random";

export type AssignOptions = {
  /** Use recent history to spread chores around (Fair Rotation). */
  fair?: boolean;
  history?: AssignmentRecord[];
  /** How many recent records to consider. */
  window?: number;
  now?: number;
};

const DEFAULT_WINDOW = 60;

/**
 * Score how "tired" a (person, chore) pairing is based on recent history.
 * Higher = this person had this chore more recently / more often. Used only
 * when Fair Rotation is on. Recency-weighted so old history fades.
 */
export function pairScore(person: string, chore: string, history: AssignmentRecord[], now: number, window = DEFAULT_WINDOW): number {
  let score = 0;
  const recent = history.slice(0, window);
  const dayMs = 86_400_000;
  for (let i = 0; i < recent.length; i++) {
    const r = recent[i];
    if (r.person !== person) continue;
    // Same chore counts a lot; any chore counts a little (balances total load).
    const ageDays = Math.max(0, (now - r.at) / dayMs);
    const decay = 1 / (1 + ageDays / 14); // half weight after two weeks
    score += (r.chore === chore ? 3 : 0.35) * decay;
  }
  return score;
}

/**
 * Assign chores to people.
 * - Every chore is used at most once before any is repeated (round-robin).
 * - When there are more people than chores, extra people get `item: null`.
 * - When there are more chores than people, people get multiple chores; each
 *   extra chore becomes another Assignment row for that person.
 * - With `fair`, candidates are ranked by pairScore (lowest first) with random
 *   tie-breaks; without it, everything is a plain shuffle.
 *
 * Never mutates inputs; never drops a person or a chore silently.
 */
export function assignChores(people: readonly Person[], items: readonly WheelItem[], opts: AssignOptions = {}): Assignment[] {
  if (people.length === 0) return [];
  const now = opts.now ?? Date.now();
  const history = opts.history ?? [];
  const fair = Boolean(opts.fair) && history.length > 0;

  const orderedPeople = shuffle(people);
  const pool = shuffle(items);

  if (pool.length === 0) {
    return orderedPeople.map((person) => ({ person, item: null }));
  }

  if (fair) return assignFair(orderedPeople, pool, history, now, opts.window);

  // Plain mode: round-robin over shuffled people until all chores are handed out.
  const result: Assignment[] = [];
  const remaining = pool.slice();
  for (const person of orderedPeople) {
    result.push({ person, item: remaining.length ? (remaining.shift() as WheelItem) : null });
  }
  let personIdx = 0;
  while (remaining.length > 0) {
    const person = orderedPeople[personIdx % orderedPeople.length];
    personIdx++;
    result.push({ person, item: remaining.shift() as WheelItem });
  }
  return sortByPerson(result, orderedPeople);
}

/**
 * Fair Rotation: a regret-based greedy. Each round, among the people who
 * currently have the fewest chores, score every remaining chore for each
 * person. The person with the biggest gap between their best and second-best
 * option ("regret") is assigned first, so someone who badly needs to avoid a
 * chore gets priority over someone who doesn't care. Repeats until chores run
 * out. Everyone still gets a row (null if there weren't enough chores).
 */
function assignFair(people: Person[], pool: WheelItem[], history: AssignmentRecord[], now: number, window?: number): Assignment[] {
  const remaining = pool.slice();
  const counts = new Map(people.map((p) => [p.id, 0]));
  const rows: Assignment[] = [];
  while (remaining.length > 0) {
    const min = Math.min(...counts.values());
    const eligible = people.filter((p) => counts.get(p.id) === min);
    let pick: { person: Person; idx: number; regret: number } | null = null;
    for (const person of eligible) {
      let bestIdx = 0;
      let best = Infinity;
      let second = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const score = pairScore(person.name, remaining[i].name, history, now, window) + randomFloat() * 0.01;
        if (score < best) {
          second = best;
          best = score;
          bestIdx = i;
        } else if (score < second) {
          second = score;
        }
      }
      const regret = (Number.isFinite(second) ? second : best) - best + randomFloat() * 0.001;
      if (!pick || regret > pick.regret) pick = { person, idx: bestIdx, regret };
    }
    if (!pick) break;
    const [item] = remaining.splice(pick.idx, 1);
    rows.push({ person: pick.person, item });
    counts.set(pick.person.id, (counts.get(pick.person.id) ?? 0) + 1);
  }
  for (const person of people) {
    if ((counts.get(person.id) ?? 0) === 0) rows.push({ person, item: null });
  }
  return sortByPerson(rows, people);
}

function sortByPerson(rows: Assignment[], people: readonly Person[]): Assignment[] {
  const order = new Map(people.map((p, i) => [p.id, i]));
  return rows.slice().sort((a, b) => (order.get(a.person.id) ?? 0) - (order.get(b.person.id) ?? 0));
}

function bestIndex(person: Person, candidates: WheelItem[], history: AssignmentRecord[], now: number, window?: number): number {
  let best = 0;
  let bestScore = Infinity;
  for (let i = 0; i < candidates.length; i++) {
    const s = pairScore(person.name, candidates[i].name, history, now, window) + randomFloat() * 0.01;
    if (s < bestScore) {
      bestScore = s;
      best = i;
    }
  }
  return best;
}

/**
 * Re-roll a single row. Prefers a chore that is not currently assigned to
 * anyone; if every chore is taken, swaps with another random row so no chore
 * is lost or duplicated.
 */
export function rerollOne(
  assignments: Assignment[],
  rowIndex: number,
  allItems: readonly WheelItem[],
  opts: AssignOptions = {},
): Assignment[] {
  const row = assignments[rowIndex];
  if (!row) return assignments;
  const now = opts.now ?? Date.now();
  const history = opts.history ?? [];
  const fair = Boolean(opts.fair) && history.length > 0;

  const takenIds = new Set(assignments.map((a) => a.item?.id).filter(Boolean));
  const free = allItems.filter((i) => !takenIds.has(i.id));

  if (free.length > 0) {
    const pool = shuffle(free);
    const idx = fair ? bestIndex(row.person, pool, history, now, opts.window) : 0;
    const next = assignments.slice();
    next[rowIndex] = { ...row, item: pool[idx] };
    return next;
  }

  // Swap with another row that has a different item.
  const others = assignments.map((a, i) => ({ a, i })).filter(({ a, i }) => i !== rowIndex && a.item && a.item.id !== row.item?.id);
  if (others.length === 0) return assignments;
  const pick = shuffle(others)[0];
  const next = assignments.slice();
  next[rowIndex] = { ...row, item: pick.a.item };
  next[pick.i] = { ...pick.a, item: row.item };
  return next;
}

/** Plain-text rendering used by "Copy assignments". */
export function formatAssignments(assignments: Assignment[], title?: string, date = new Date()): string {
  const lines: string[] = [];
  const heading = title?.trim() ? title.trim() : "Chore assignments";
  lines.push(`${heading} — ${date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push("");
  const byPerson = new Map<string, string[]>();
  for (const a of assignments) {
    const list = byPerson.get(a.person.name) ?? [];
    if (a.item) list.push(a.item.name);
    byPerson.set(a.person.name, list);
  }
  for (const [person, chores] of byPerson) {
    lines.push(`${person}: ${chores.length ? chores.join(", ") : "— (free this round)"}`);
  }
  return lines.join("\n");
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export function assignmentsToCsv(assignments: Assignment[], date = new Date()): string {
  const d = date.toISOString().slice(0, 10);
  const rows = [["Date", "Person", "Chore"].join(",")];
  for (const a of assignments) {
    rows.push([d, csvCell(a.person.name), csvCell(a.item?.name ?? "")].join(","));
  }
  return rows.join("\r\n");
}
