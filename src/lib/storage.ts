/**
 * The only module allowed to touch `localStorage` / `sessionStorage` directly.
 * Everything else goes through these helpers — enforced by the
 * `no-restricted-properties` rule in `eslint.config.js`.
 *
 * Why this exists: web storage does not merely return `null` when unavailable,
 * **the accessor itself throws**. A private window, blocked site data, a
 * storage quota that is already full, or an embedded/thumbnail context all
 * raise a `SecurityError` or `QuotaExceededError`. Several hooks read storage
 * inside a `useState` initialiser, which runs *during render* — so one throw
 * there unmounts the whole tree and the user gets a blank page. That failure
 * has already happened once in this app for a different reason, and 17 call
 * sites were one private-mode visit away from reproducing it.
 *
 * Every function here is total: it returns a fallback rather than throwing.
 */

type Store = 'local' | 'session';

/** Resolve a backing store, or null when storage is unusable in this context. */
function backing(store: Store): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return store === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    // Accessing the property itself can throw when site data is blocked.
    return null;
  }
}

/** Read a raw string. Returns null when missing or storage is unavailable. */
export function safeGet(key: string, store: Store = 'local'): string | null {
  try {
    return backing(store)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Write a raw string. Returns false when the write could not be persisted. */
export function safeSet(key: string, value: string, store: Store = 'local'): boolean {
  try {
    const s = backing(store);
    // Must check explicitly: `backing(store)?.setItem(...)` short-circuits when
    // there is no store and then falls through to `return true`, reporting a
    // write that never happened. A test caught exactly that.
    if (s === null) return false;
    s.setItem(key, value);
    return true;
  } catch {
    // Most often QuotaExceededError, or Safari private mode.
    return false;
  }
}

/** Delete a key. Never throws. */
export function safeRemove(key: string, store: Store = 'local'): void {
  try {
    backing(store)?.removeItem(key);
  } catch {
    /* nothing to do */
  }
}

/**
 * Read and parse JSON, falling back on anything going wrong — missing key,
 * unavailable storage, or a corrupt/partially-written value. The fallback is
 * also returned when the stored value parses to `null`, so callers never have
 * to handle `null` separately.
 */
export function getJSON<T>(key: string, fallback: T, store: Store = 'local'): T {
  const raw = safeGet(key, store);
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** Serialise and store a value. Returns false when it could not be persisted. */
export function setJSON(key: string, value: unknown, store: Store = 'local'): boolean {
  try {
    return safeSet(key, JSON.stringify(value), store);
  } catch {
    // JSON.stringify throws on circular structures and BigInt.
    return false;
  }
}

/**
 * Read a value constrained to a known set, falling back when the stored string
 * isn't one of them. Guards against a hand-edited or stale value widening a
 * union type it no longer belongs to.
 */
export function getEnum<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
  store: Store = 'local',
): T {
  const raw = safeGet(key, store);
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/** True when writes actually persist — useful for warning the user once. */
export function isStorageAvailable(store: Store = 'local'): boolean {
  const probe = '__prephub_probe__';
  if (!safeSet(probe, '1', store)) return false;
  safeRemove(probe, store);
  return true;
}
