/**
 * Pure geometry for the SVG wheel. The pointer sits at the top (12 o'clock).
 * Segment i occupies [i*step, (i+1)*step) degrees measured clockwise from the
 * top when the wheel's rotation is 0.
 */

export const WHEEL_SIZE = 400; // viewBox units
export const CENTER = WHEEL_SIZE / 2;
export const RADIUS = CENTER - 4;

/** 12 hues chosen for readable dark text and enough separation between neighbours. */
export const WHEEL_COLORS = [
  "#F9C74F",
  "#90BE6D",
  "#F8961E",
  "#43AA8B",
  "#F3722C",
  "#4D908E",
  "#F94144",
  "#577590",
  "#F9844A",
  "#277DA1",
  "#FFD166",
  "#06D6A0",
];

export const segmentColor = (i: number, total: number) => {
  // Avoid identical colours on the first and last segment when they meet.
  const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
  if (i === total - 1 && total > 1 && total % WHEEL_COLORS.length === 1) {
    return WHEEL_COLORS[(i + 3) % WHEEL_COLORS.length];
  }
  return color;
};

const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

export const polar = (deg: number, r = RADIUS) => ({
  x: CENTER + r * Math.cos(toRad(deg)),
  y: CENTER + r * Math.sin(toRad(deg)),
});

/** SVG path for a pie slice from startDeg to endDeg (clockwise from top). */
export function slicePath(startDeg: number, endDeg: number): string {
  const sweep = endDeg - startDeg;
  if (sweep >= 360) {
    // Full circle: two arcs.
    const a = polar(0);
    const b = polar(180);
    return `M ${a.x} ${a.y} A ${RADIUS} ${RADIUS} 0 1 1 ${b.x} ${b.y} A ${RADIUS} ${RADIUS} 0 1 1 ${a.x} ${a.y} Z`;
  }
  const s = polar(startDeg);
  const e = polar(endDeg);
  const large = sweep > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

/** Angle (deg from top, clockwise) at the middle of segment i. */
export const segmentMidAngle = (i: number, total: number) => (360 / total) * (i + 0.5);

/**
 * Compute the rotation (in degrees, applied as CSS rotate) that lands segment
 * `index` under the top pointer, adding `turns` full rotations from the
 * current rotation. `jitter` (0..1) offsets the landing point within the
 * segment so it doesn't always stop dead centre.
 */
export function targetRotation(currentRotation: number, index: number, total: number, turns: number, jitter = 0.5): number {
  const step = 360 / total;
  // Keep away from the segment edges so the pointer isn't ambiguous.
  const j = 0.15 + Math.min(Math.max(jitter, 0), 1) * 0.7;
  const landingAngle = step * (index + j); // where the pointer should be, in wheel coords
  // The wheel rotates clockwise by R; a point at angle a ends up at a + R.
  // We want a point at landingAngle to end at 0 (mod 360): R ≡ -landingAngle.
  const base = (((360 - landingAngle) % 360) + 360) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = base - currentMod;
  if (delta <= 0) delta += 360;
  return currentRotation + turns * 360 + delta;
}

/** Given a final rotation, which segment is under the pointer? (for tests) */
export function segmentAtRotation(rotation: number, total: number): number {
  const step = 360 / total;
  const pointerInWheel = (((360 - (rotation % 360)) % 360) + 360) % 360;
  return Math.floor(pointerInWheel / step) % total;
}

/** Trim label to fit segment width roughly. */
export function fitLabel(name: string, total: number): string {
  const max = total <= 6 ? 22 : total <= 12 ? 18 : total <= 20 ? 14 : total <= 40 ? 10 : 6;
  const chars = Array.from(name);
  return chars.length > max ? chars.slice(0, Math.max(1, max - 1)).join("") + "…" : name;
}
