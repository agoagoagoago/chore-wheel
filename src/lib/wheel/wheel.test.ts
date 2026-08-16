import { describe, expect, it } from "vitest";
import { randomIndex, selectWinner, shuffle } from "./random";
import { segmentAtRotation, targetRotation, slicePath, fitLabel } from "./geometry";
import { initialState, reducer, normalizeState, makeItem, cleanName } from "./state";
import { LIMITS } from "@/config/site";

describe("random", () => {
  it("randomIndex stays within range", () => {
    for (let n = 1; n <= 13; n++) {
      for (let i = 0; i < 200; i++) {
        const r = randomIndex(n);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(n);
      }
    }
  });
  it("randomIndex rejects n <= 0", () => {
    expect(() => randomIndex(0)).toThrow();
    expect(() => randomIndex(-1)).toThrow();
  });
  it("selectWinner returns an existing item and null for empty", () => {
    expect(selectWinner([])).toBeNull();
    const one = selectWinner(["only"]);
    expect(one).toEqual({ index: 0, item: "only" });
    const items = ["a", "b", "c", "d"];
    for (let i = 0; i < 100; i++) {
      const w = selectWinner(items)!;
      expect(items[w.index]).toBe(w.item);
    }
  });
  it("shuffle keeps all items", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const s = shuffle(items);
    expect(s).toHaveLength(50);
    expect(s.slice().sort((a, b) => a - b)).toEqual(items);
    expect(items[0]).toBe(0); // not mutated
  });
});

describe("geometry", () => {
  it("targetRotation lands the chosen segment under the pointer", () => {
    for (const total of [1, 2, 3, 7, 12, 40, 100]) {
      for (let idx = 0; idx < total; idx++) {
        for (const jitter of [0, 0.5, 1]) {
          const rot = targetRotation(123.4, idx, total, 5, jitter);
          expect(rot).toBeGreaterThan(123.4 + 5 * 360);
          expect(segmentAtRotation(rot, total)).toBe(idx);
        }
      }
    }
  });
  it("slicePath handles full circle and slices", () => {
    expect(slicePath(0, 360)).toContain("A");
    expect(slicePath(0, 30)).toMatch(/^M /);
  });
  it("fitLabel truncates long names", () => {
    expect(fitLabel("Short", 12)).toBe("Short");
    expect(fitLabel("A very very very long chore name indeed", 12).length).toBeLessThanOrEqual(19);
    expect(fitLabel("🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹🧹", 12)).toMatch(/…$/);
  });
});

describe("reducer", () => {
  it("adds, edits, removes and moves items", () => {
    let s = reducer(initialState(), { type: "clear-items" });
    expect(s.items).toHaveLength(0);
    s = reducer(s, { type: "add-item", name: "  Wash   dishes " });
    s = reducer(s, { type: "add-item", name: "Vacuum" });
    expect(s.items.map((i) => i.name)).toEqual(["Wash dishes", "Vacuum"]);
    s = reducer(s, { type: "edit-item", id: s.items[0].id, name: "Dishes" });
    expect(s.items[0].name).toBe("Dishes");
    s = reducer(s, { type: "move-item", id: s.items[0].id, direction: 1 });
    expect(s.items.map((i) => i.name)).toEqual(["Vacuum", "Dishes"]);
    s = reducer(s, { type: "remove-item", id: s.items[0].id });
    expect(s.items.map((i) => i.name)).toEqual(["Dishes"]);
  });

  it("ignores empty names and enforces the chore limit", () => {
    let s = reducer(initialState(), { type: "clear-items" });
    s = reducer(s, { type: "add-item", name: "   " });
    expect(s.items).toHaveLength(0);
    for (let i = 0; i < LIMITS.maxChores + 10; i++) s = reducer(s, { type: "add-item", name: `Chore ${i}` });
    expect(s.items).toHaveLength(LIMITS.maxChores);
  });

  it("caps very long names and keeps emoji / non-latin text", () => {
    expect(cleanName("x".repeat(500))).toHaveLength(LIMITS.maxNameLength);
    expect(cleanName("🧹 Пылесосить 掃除")).toBe("🧹 Пылесосить 掃除");
    expect(cleanName("bad" + String.fromCharCode(0, 7, 27) + "chars" + String.fromCharCode(31))).toBe("badchars");
  });

  it("add-items dedupes by chore id and by name", () => {
    let s = reducer(initialState(), { type: "clear-items" });
    s = reducer(s, { type: "add-items", items: [{ name: "Wash dishes", choreId: "wash-dishes" }, { name: "Vacuum" }] });
    s = reducer(s, { type: "add-items", items: [{ name: "Wash dishes", choreId: "wash-dishes" }, { name: "vacuum" }, { name: "Mop" }] });
    expect(s.items.map((i) => i.name)).toEqual(["Wash dishes", "Vacuum", "Mop"]);
  });

  it("records spins and removes winner when option is set", () => {
    let s = initialState();
    const first = s.items[0];
    s = reducer(s, { type: "record-spin", item: first });
    expect(s.history[0].name).toBe(first.name);
    expect(s.items).toContain(first);
    s = reducer(s, { type: "set-option", key: "removeAfterSpin", value: true });
    s = reducer(s, { type: "record-spin", item: first });
    expect(s.items.find((i) => i.id === first.id)).toBeUndefined();
    expect(s.history).toHaveLength(2);
    s = reducer(s, { type: "clear-history" });
    expect(s.history).toHaveLength(0);
  });

  it("mark-done removes item and logs it", () => {
    let s = initialState();
    const item = s.items[2];
    s = reducer(s, { type: "mark-done", item });
    expect(s.doneToday[0].name).toBe(item.name);
    expect(s.items.find((i) => i.id === item.id)).toBeUndefined();
  });

  it("sorts and restores defaults", () => {
    let s = reducer(initialState(), { type: "sort-items" });
    const names = s.items.map((i) => i.name);
    expect(names).toEqual(names.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
    s = reducer(s, { type: "clear-items" });
    s = reducer(s, { type: "restore-defaults" });
    expect(s.items.length).toBeGreaterThan(5);
  });

  it("people: add/edit/remove and limit", () => {
    let s = reducer(initialState(), { type: "clear-people" });
    for (let i = 0; i < LIMITS.maxPeople + 5; i++) s = reducer(s, { type: "add-person", name: `P${i}` });
    expect(s.people).toHaveLength(LIMITS.maxPeople);
    s = reducer(s, { type: "edit-person", id: s.people[0].id, name: "Renamed" });
    expect(s.people[0].name).toBe("Renamed");
    s = reducer(s, { type: "remove-person", id: s.people[0].id });
    expect(s.people.find((p) => p.name === "Renamed")).toBeUndefined();
  });
});

describe("normalizeState", () => {
  it("returns defaults for garbage", () => {
    for (const bad of [null, undefined, 42, "x", [], { items: "nope" }, { __proto__: { polluted: true } }]) {
      const s = normalizeState(bad);
      expect(s.version).toBe(1);
      expect(Array.isArray(s.items)).toBe(true);
    }
  });
  it("keeps valid data and drops invalid entries", () => {
    const s = normalizeState({
      title: "Our home",
      items: [{ name: "Ok", choreId: "wash-dishes" }, { name: 5 }, "Plain string", { choreId: "../evil" }],
      people: ["A", { name: "B" }, 3, ""],
      options: { removeAfterSpin: "yes", fairRotation: true },
      history: [{ name: "x", at: 1 }, { name: "bad" }],
      assignmentHistory: [{ person: "A", chore: "Ok", at: 2 }, { person: 1 }],
      templateId: "kitchen",
    });
    expect(s.title).toBe("Our home");
    expect(s.items.map((i) => i.name)).toEqual(["Ok", "Plain string"]);
    expect(s.items[0].choreId).toBe("wash-dishes");
    expect(s.people.map((p) => p.name)).toEqual(["A", "B"]);
    expect(s.options.removeAfterSpin).toBe(false);
    expect(s.options.fairRotation).toBe(true);
    expect(s.history).toHaveLength(1);
    expect(s.assignmentHistory).toHaveLength(1);
    expect(s.templateId).toBe("kitchen");
  });
  it("makeItem cleans names", () => {
    expect(makeItem("  a  b ").name).toBe("a b");
  });
});
