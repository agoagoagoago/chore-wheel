import { describe, expect, it } from "vitest";
import { assignChores, rerollOne, formatAssignments, assignmentsToCsv, pairScore } from "./assign";
import type { AssignmentRecord, Person, WheelItem } from "@/lib/wheel/state";

const people = (n: number): Person[] => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Person ${i}` }));
const items = (n: number): WheelItem[] => Array.from({ length: n }, (_, i) => ({ id: `c${i}`, name: `Chore ${i}` }));

describe("assignChores", () => {
  it("returns empty for no people", () => {
    expect(assignChores([], items(3))).toEqual([]);
  });

  it("gives every person a null row when there are no chores", () => {
    const r = assignChores(people(3), []);
    expect(r).toHaveLength(3);
    expect(r.every((a) => a.item === null)).toBe(true);
  });

  it("uses each chore exactly once when people >= chores; extra people are free", () => {
    const r = assignChores(people(5), items(3));
    expect(r).toHaveLength(5);
    const used = r.map((a) => a.item?.id).filter(Boolean);
    expect(new Set(used).size).toBe(3);
    expect(r.filter((a) => a.item === null)).toHaveLength(2);
  });

  it("hands out every chore when chores > people, balanced across people", () => {
    const r = assignChores(people(3), items(8));
    expect(r.filter((a) => a.item)).toHaveLength(8);
    const ids = r.map((a) => a.item!.id).sort();
    expect(ids).toEqual(
      items(8)
        .map((i) => i.id)
        .sort(),
    );
    const counts = new Map<string, number>();
    for (const a of r) counts.set(a.person.id, (counts.get(a.person.id) ?? 0) + 1);
    const values = [...counts.values()];
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
    // no person lost
    expect(new Set(r.map((a) => a.person.id)).size).toBe(3);
  });

  it("fair mode avoids repeating a recent person→chore pairing when alternatives exist", () => {
    const now = 1_000_000_000_000;
    const ppl = people(2);
    const its = items(2);
    // Person 0 just did Chore 0 many times.
    const history: AssignmentRecord[] = Array.from({ length: 5 }, (_, i) => ({ person: "Person 0", chore: "Chore 0", at: now - i * 1000 }));
    let repeats = 0;
    for (let i = 0; i < 40; i++) {
      const r = assignChores(ppl, its, { fair: true, history, now });
      const p0 = r.find((a) => a.person.id === "p0")!;
      if (p0.item?.name === "Chore 0") repeats++;
    }
    expect(repeats).toBe(0);
  });

  it("pairScore decays with age and counts same-chore more than other chores", () => {
    const now = 1_000_000_000_000;
    const same = pairScore("A", "X", [{ person: "A", chore: "X", at: now }], now);
    const other = pairScore("A", "X", [{ person: "A", chore: "Y", at: now }], now);
    const old = pairScore("A", "X", [{ person: "A", chore: "X", at: now - 60 * 86_400_000 }], now);
    expect(same).toBeGreaterThan(other);
    expect(same).toBeGreaterThan(old);
    expect(pairScore("B", "X", [{ person: "A", chore: "X", at: now }], now)).toBe(0);
  });
});

describe("rerollOne", () => {
  it("prefers an unassigned chore and never duplicates", () => {
    const all = items(4);
    const r = assignChores(people(2), all.slice(0, 2));
    const next = rerollOne(r, 0, all);
    const ids = next.map((a) => a.item?.id);
    expect(new Set(ids).size).toBe(2);
    expect(["c2", "c3"]).toContain(next[0].item?.id);
  });
  it("swaps when everything is taken", () => {
    const all = items(2);
    const r = assignChores(people(2), all);
    const next = rerollOne(r, 0, all);
    expect(next[0].item?.id).toBe(r[1].item?.id);
    expect(next[1].item?.id).toBe(r[0].item?.id);
  });
  it("is a no-op for a bad index", () => {
    const r = assignChores(people(2), items(2));
    expect(rerollOne(r, 9, items(2))).toBe(r);
  });
});

describe("formatting", () => {
  it("formats plain text and CSV, escaping quotes", () => {
    const r = [
      { person: { id: "a", name: 'Alex "A"' }, item: { id: "x", name: "Mop, floors" } },
      { person: { id: "b", name: "Bo" }, item: null },
    ];
    const text = formatAssignments(r, "Home", new Date("2026-01-02T00:00:00Z"));
    expect(text).toContain('Alex "A": Mop, floors');
    expect(text).toContain("Bo: —");
    const csv = assignmentsToCsv(r, new Date("2026-01-02T00:00:00Z"));
    expect(csv.split("\r\n")[1]).toBe('2026-01-02,"Alex ""A""","Mop, floors"');
  });
});
