/**
 * Randomness helpers. Uses the browser's crypto.getRandomValues when present
 * (rejection sampling keeps the index uniform) and falls back to Math.random.
 * We do not claim cryptographic fairness in the UI — only that selection is
 * uniform and independent of the animation.
 */

const hasCrypto = () => typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function";

/** Uniform integer in [0, n). Throws for n <= 0. */
export function randomIndex(n: number): number {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError("randomIndex requires n > 0");
  if (n === 1) return 0;
  if (hasCrypto()) {
    const buf = new Uint32Array(1);
    const range = 0x100000000; // 2^32
    const limit = range - (range % n); // largest multiple of n below 2^32
    // Rejection sampling: retry when the sample falls in the biased tail.
    for (let i = 0; i < 100; i++) {
      globalThis.crypto.getRandomValues(buf);
      if (buf[0] < limit) return buf[0] % n;
    }
  }
  return Math.floor(Math.random() * n);
}

/** Uniform float in [0, 1). */
export function randomFloat(): number {
  if (hasCrypto()) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  return Math.random();
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick one item uniformly. Returns null for an empty list. */
export function pickOne<T>(items: readonly T[]): T | null {
  if (items.length === 0) return null;
  return items[randomIndex(items.length)];
}

/**
 * Select the winning index of a wheel. Kept separate from any animation so
 * the outcome is decided first and the wheel then animates to it.
 */
export function selectWinner<T>(items: readonly T[]): { index: number; item: T } | null {
  if (items.length === 0) return null;
  const index = randomIndex(items.length);
  return { index, item: items[index] };
}
