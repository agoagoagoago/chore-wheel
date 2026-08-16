import { LIMITS } from "@/config/site";
import { getChore } from "@/lib/chores/data";
import { cleanName, type WheelItem, type Person, type WheelOptions } from "@/lib/wheel/state";

/**
 * Share-URL codec.
 *
 * A wheel is encoded as a compact JSON payload → UTF-8 → base64url and placed
 * in the URL *hash* (`/#w=...`). The hash is never sent to the server and never
 * indexed, so shared wheels can't turn into duplicate pages. Library chores
 * are stored as `#id` (short and language-independent); custom chores as
 * plain names.
 *
 * Decoding is defensive: any malformed input yields `null` and never throws.
 */

export type SharePayload = {
  title: string;
  items: { name: string; choreId?: string }[];
  people: string[];
  options: Pick<WheelOptions, "removeAfterSpin" | "fairRotation">;
};

type Wire = {
  v: 1;
  t?: string;
  c: string[]; // "#choreId" or literal name
  p?: string[];
  o?: number; // bit flags: 1 = removeAfterSpin, 2 = fairRotation
};

const enc = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const dec = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

export function encodeShare(payload: SharePayload): string {
  const wire: Wire = {
    v: 1,
    c: payload.items.slice(0, LIMITS.maxChores).map((i) => {
      const lib = i.choreId ? getChore(i.choreId) : undefined;
      return lib && lib.name === i.name ? `#${lib.id}` : i.name.replace(/^#/, "# ");
    }),
  };
  if (payload.title) wire.t = payload.title;
  if (payload.people.length) wire.p = payload.people.slice(0, LIMITS.maxPeople);
  const flags = (payload.options.removeAfterSpin ? 1 : 0) | (payload.options.fairRotation ? 2 : 0);
  if (flags) wire.o = flags;
  return enc(JSON.stringify(wire));
}

export function decodeShare(token: string): SharePayload | null {
  try {
    if (typeof token !== "string" || token.length === 0 || token.length > LIMITS.maxSharePayloadBytes * 2) return null;
    if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
    const json = dec(token);
    if (json.length > LIMITS.maxSharePayloadBytes) return null;
    const raw: unknown = JSON.parse(json);
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
    const w = raw as Record<string, unknown>;
    if (w.v !== 1 || !Array.isArray(w.c)) return null;

    const items: SharePayload["items"] = [];
    for (const entry of w.c.slice(0, LIMITS.maxChores)) {
      if (typeof entry !== "string") continue;
      if (entry.startsWith("#") && !entry.startsWith("# ")) {
        const lib = getChore(entry.slice(1));
        if (lib) items.push({ name: lib.name, choreId: lib.id });
        continue;
      }
      const name = cleanName(entry.startsWith("# ") ? entry.slice(2) : entry);
      if (name) items.push({ name });
    }

    const people: string[] = [];
    if (Array.isArray(w.p)) {
      for (const p of w.p.slice(0, LIMITS.maxPeople)) {
        if (typeof p !== "string") continue;
        const name = cleanName(p);
        if (name) people.push(name);
      }
    }

    const flags = typeof w.o === "number" && Number.isInteger(w.o) ? w.o : 0;
    const title = typeof w.t === "string" ? cleanName(w.t).slice(0, 80) : "";

    if (items.length === 0 && people.length === 0) return null;
    return {
      title,
      items,
      people,
      options: { removeAfterSpin: Boolean(flags & 1), fairRotation: Boolean(flags & 2) },
    };
  } catch {
    return null;
  }
}

export const payloadFromState = (s: { title: string; items: WheelItem[]; people: Person[]; options: WheelOptions }): SharePayload => ({
  title: s.title,
  items: s.items.map((i) => ({ name: i.name, choreId: i.choreId })),
  people: s.people.map((p) => p.name),
  options: { removeAfterSpin: s.options.removeAfterSpin, fairRotation: s.options.fairRotation },
});

/** Build a full share URL for the given origin/path. */
export const buildShareUrl = (origin: string, path: string, token: string) => `${origin}${path}#w=${token}`;

/** Read `#w=` or `#add=` from a hash string. */
export function parseHash(hash: string): { share?: string; add?: string[]; template?: string } {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!h) return {};
  const params = new URLSearchParams(h);
  const out: { share?: string; add?: string[]; template?: string } = {};
  const w = params.get("w");
  if (w) out.share = w;
  const t = params.get("t");
  if (t && /^[a-z0-9-]{1,40}$/.test(t)) out.template = t;
  const add = params.get("add");
  if (add) {
    out.add = add
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[a-z0-9-]{1,40}$/.test(s))
      .slice(0, LIMITS.maxChores);
  }
  return out;
}
