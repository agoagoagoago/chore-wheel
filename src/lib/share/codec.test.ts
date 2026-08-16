import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare, parseHash, payloadFromState } from "./codec";
import { initialState } from "@/lib/wheel/state";
import { LIMITS } from "@/config/site";

describe("share codec", () => {
  it("round-trips a full state", () => {
    const s = initialState();
    s.title = "Casa Übel 🏠";
    s.items.push({ id: "z", name: "Custom chore ✨" });
    s.options.fairRotation = true;
    const token = encodeShare(payloadFromState(s));
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    const back = decodeShare(token)!;
    expect(back).not.toBeNull();
    expect(back.title).toBe(s.title);
    expect(back.items.map((i) => i.name)).toEqual(s.items.map((i) => i.name));
    expect(back.items[0].choreId).toBe(s.items[0].choreId);
    expect(back.people).toEqual(s.people.map((p) => p.name));
    expect(back.options.fairRotation).toBe(true);
    expect(back.options.removeAfterSpin).toBe(false);
  });

  it("uses compact ids for library chores", () => {
    const s = initialState();
    const token = encodeShare(payloadFromState(s));
    expect(token.length).toBeLessThan(400);
  });

  it("does not crash on malformed input", () => {
    for (const bad of [
      "",
      "!!!",
      "not-base64-json",
      btoa("{}"),
      btoa("[]"),
      btoa('{"v":2,"c":[]}'),
      btoa('{"v":1,"c":"x"}'),
      btoa('{"v":1,"c":[]}'),
      "A".repeat(50_000),
    ]) {
      expect(() => decodeShare(bad)).not.toThrow();
      expect(decodeShare(bad)).toBeNull();
    }
  });

  it("caps sizes and strips unknown ids", () => {
    const many = Array.from({ length: 500 }, (_, i) => `Chore ${i}`);
    const token = encodeShare({
      title: "",
      items: many.map((name) => ({ name })),
      people: [],
      options: { removeAfterSpin: false, fairRotation: false },
    });
    const back = decodeShare(token)!;
    expect(back.items.length).toBeLessThanOrEqual(LIMITS.maxChores);
    const t2 = btoa(
      JSON.stringify({ v: 1, c: ["#does-not-exist", "#wash-dishes", "# literal hash", 42, "<script>alert(1)</script>"], p: ["A", 1] }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const b2 = decodeShare(t2)!;
    expect(b2.items.map((i) => i.name)).toEqual(["Wash dishes", "literal hash", "<script>alert(1)</script>"]);
    expect(b2.people).toEqual(["A"]);
  });

  it("parses hash params", () => {
    expect(parseHash("#w=abc")).toEqual({ share: "abc" });
    expect(parseHash("#add=wash-dishes,../x,mop-floors")).toEqual({ add: ["wash-dishes", "mop-floors"] });
    expect(parseHash("")).toEqual({});
  });
});
