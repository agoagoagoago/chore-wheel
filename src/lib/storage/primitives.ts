/**
 * Safe localStorage primitives. Everything is wrapped in try/catch: private
 * mode, disabled storage, quota errors and corrupted JSON all degrade to
 * "no saved data" rather than breaking the app.
 */

export function storageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const k = "__cw_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
