import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { safeGet, safeSet, safeRemove, getJSON, setJSON, getEnum, isStorageAvailable } from './storage';

/** A minimal in-memory Storage stand-in. */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => { map.delete(k); },
    setItem: (k: string, v: string) => { map.set(k, v); },
  };
}

function install(store: Storage | (() => never)) {
  vi.stubGlobal('window', {
    get localStorage() { return typeof store === 'function' ? store() : store; },
    get sessionStorage() { return typeof store === 'function' ? store() : store; },
  });
}

describe('storage — happy path', () => {
  beforeEach(() => { install(memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('round-trips a string', () => {
    expect(safeSet('k', 'v')).toBe(true);
    expect(safeGet('k')).toBe('v');
  });

  it('returns null for a missing key', () => {
    expect(safeGet('nope')).toBeNull();
  });

  it('removes a key', () => {
    safeSet('k', 'v');
    safeRemove('k');
    expect(safeGet('k')).toBeNull();
  });

  it('round-trips JSON', () => {
    setJSON('obj', { a: 1, b: [2, 3] });
    expect(getJSON('obj', {})).toEqual({ a: 1, b: [2, 3] });
  });

  it('falls back when the stored JSON is corrupt', () => {
    safeSet('obj', '{not json');
    expect(getJSON('obj', { safe: true })).toEqual({ safe: true });
  });

  it('falls back when the stored JSON is literally null', () => {
    safeSet('obj', 'null');
    expect(getJSON('obj', { safe: true })).toEqual({ safe: true });
  });

  it('setJSON survives a circular structure instead of throwing', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(setJSON('c', circular)).toBe(false);
  });

  it('getEnum rejects a value outside the allowed set', () => {
    safeSet('size', 'gigantic');
    expect(getEnum('size', ['small', 'medium', 'large'] as const, 'medium')).toBe('medium');
    safeSet('size', 'large');
    expect(getEnum('size', ['small', 'medium', 'large'] as const, 'medium')).toBe('large');
  });

  it('reports storage as available', () => {
    expect(isStorageAvailable()).toBe(true);
  });
});

// This is the case the whole module exists for: private mode and blocked site
// data make the *accessor itself* throw, and several hooks read storage inside
// a useState initialiser, which runs during render. An escaping throw there
// unmounts the tree and the user sees a blank page.
describe('storage — when access throws (private mode / blocked site data)', () => {
  beforeEach(() => {
    install(() => { throw new DOMException('denied', 'SecurityError'); });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('safeGet returns null rather than throwing', () => {
    expect(() => safeGet('k')).not.toThrow();
    expect(safeGet('k')).toBeNull();
  });

  it('safeSet reports failure rather than throwing', () => {
    expect(() => safeSet('k', 'v')).not.toThrow();
    expect(safeSet('k', 'v')).toBe(false);
  });

  it('safeRemove does not throw', () => {
    expect(() => safeRemove('k')).not.toThrow();
  });

  it('getJSON returns the fallback', () => {
    expect(getJSON('k', { fallback: 1 })).toEqual({ fallback: 1 });
  });

  it('getEnum returns the fallback', () => {
    expect(getEnum('k', ['a', 'b'] as const, 'a')).toBe('a');
  });

  it('reports storage as unavailable', () => {
    expect(isStorageAvailable()).toBe(false);
  });
});

describe('storage — server-side / no window', () => {
  beforeEach(() => { vi.stubGlobal('window', undefined); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('degrades to the fallback without throwing', () => {
    expect(safeGet('k')).toBeNull();
    expect(safeSet('k', 'v')).toBe(false);
    expect(getJSON('k', 42)).toBe(42);
  });
});
