import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncEngine, removeSyncedProgress, type RemoteStore, type SyncState } from './syncEngine';
import { getJSON, onSyncedWrite, setJSON, safeGet } from './storage';
import type { SyncedKey } from './syncKeys';

/** In-memory localStorage plus the window events the engine listens to. */
function installWindow(): EventTarget {
  const map = new Map<string, string>();
  const events = new EventTarget();
  vi.stubGlobal('window', {
    localStorage: {
      get length() { return map.size; },
      clear: () => map.clear(),
      getItem: (k: string) => map.get(k) ?? null,
      key: (i: number) => [...map.keys()][i] ?? null,
      removeItem: (k: string) => { map.delete(k); },
      setItem: (k: string, v: string) => { map.set(k, v); },
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  });
  return events;
}

/**
 * An account copy in memory, behaving like Firestore: snapshots arrive
 * asynchronously, and `update` is an atomic read-modify-write.
 */
class FakeRemote implements RemoteStore {
  readonly docs = new Map<string, unknown>();
  writes = 0;
  updates = 0;
  offline = false;
  private readonly subs = new Map<string, Set<(v: unknown) => void>>();

  subscribe(key: SyncedKey, onValue: (v: unknown) => void): () => void {
    const set = this.subs.get(key) ?? new Set();
    set.add(onValue);
    this.subs.set(key, set);
    queueMicrotask(() => onValue(this.docs.get(key)));
    return () => { set.delete(onValue); };
  }

  async update(key: SyncedKey, compute: (current: unknown) => unknown): Promise<void> {
    this.updates++;
    await Promise.resolve();
    if (this.offline) throw Object.assign(new Error('offline'), { code: 'unavailable' });
    const next = compute(this.docs.get(key));
    if (next !== undefined) this.set(key, next);
  }

  /** A write from this device or another one: every listener hears about it. */
  set(key: string, value: unknown): void {
    this.writes++;
    this.docs.set(key, structuredClone(value));
    for (const fn of this.subs.get(key) ?? []) queueMicrotask(() => fn(structuredClone(value)));
  }
}

const bm = (id: string) => ({ id, type: 'quiz', questionId: id, questionText: `${id}?`, createdAt: '2026-10-01T00:00:00Z' });

let remote: FakeRemote;
let states: SyncState[];
let engine: SyncEngine;
let events: EventTarget;

function startEngine(): void {
  engine = new SyncEngine('alice', remote, (s) => states.push(s), 3000);
  engine.start();
}
const last = () => states[states.length - 1];

beforeEach(() => {
  vi.useFakeTimers();
  events = installWindow();
  remote = new FakeRemote();
  states = [];
});

afterEach(() => {
  engine?.stop();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SyncEngine', () => {
  it('first sign-in: merges this device into the account and the account into this device', async () => {
    setJSON('bookmarks', [bm('a')]);
    remote.docs.set('bookmarks', [bm('b')]);
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    expect(getJSON('bookmarks', [])).toEqual([bm('a'), bm('b')]);
    expect(remote.docs.get('bookmarks')).toEqual([bm('a'), bm('b')]);
    expect(last()).toEqual({ status: 'synced', addedLocalProgress: true });
  });

  it('creates no empty documents for keys neither side has', async () => {
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    expect(remote.writes).toBe(0);
    expect(last().status).toBe('synced');
  });

  it('pushes a burst of local saves once, after the debounce', async () => {
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    setJSON('bookmarks', [bm('a')]);
    setJSON('bookmarks', [bm('a'), bm('b')]);
    await vi.advanceTimersByTimeAsync(2900);
    expect(remote.writes).toBe(0);
    expect(last().status).toBe('syncing');
    await vi.advanceTimersByTimeAsync(200);
    expect(remote.writes).toBe(1);
    expect(remote.docs.get('bookmarks')).toEqual([bm('a'), bm('b')]);
    expect(last().status).toBe('synced');
  });

  it("applies another device's change as a sync write, and does not push it back", async () => {
    setJSON('bookmarks', [bm('a')]);
    remote.docs.set('bookmarks', [bm('a')]);
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    const fromSync: boolean[] = [];
    const stop = onSyncedWrite((_k, s) => fromSync.push(s));
    remote.set('bookmarks', [bm('a'), bm('c')]);
    await vi.advanceTimersByTimeAsync(5000);
    stop();
    expect(getJSON('bookmarks', [])).toEqual([bm('a'), bm('c')]);
    expect(fromSync).toEqual([true]);
    expect(remote.updates, 'no transaction for a change that came from the account').toBe(0);
  });

  it('a bookmark removed on another device is removed here too', async () => {
    setJSON('bookmarks', [bm('a'), bm('b')]);
    remote.docs.set('bookmarks', [bm('a'), bm('b')]);
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    remote.set('bookmarks', [bm('a')]);
    await vi.advanceTimersByTimeAsync(10);
    expect(getJSON('bookmarks', [])).toEqual([bm('a')]);
  });

  it('a change made elsewhere while a local save waits is merged, not overwritten', async () => {
    setJSON('bookmarks', [bm('a')]);
    remote.docs.set('bookmarks', [bm('a')]);
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    setJSON('bookmarks', [bm('a'), bm('local')]);
    // Another device writes straight to the account; this device has not heard yet.
    remote.docs.set('bookmarks', [bm('a'), bm('other')]);
    await vi.advanceTimersByTimeAsync(3100);
    expect(remote.docs.get('bookmarks')).toEqual([bm('a'), bm('local'), bm('other')]);
    expect(getJSON('bookmarks', [])).toEqual([bm('a'), bm('local'), bm('other')]);
  });

  it('offline: keeps the change on the device, says so, and pushes it when the connection returns', async () => {
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    remote.offline = true;
    setJSON('bookmarks', [bm('a')]);
    await vi.advanceTimersByTimeAsync(3100);
    expect(last().status).toBe('offline');
    expect(getJSON('bookmarks', [])).toEqual([bm('a')]);
    expect(await engine.flush(1000)).toBe(false);
    remote.offline = false;
    events.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(10);
    expect(remote.docs.get('bookmarks')).toEqual([bm('a')]);
    expect(last().status).toBe('synced');
  });

  it('flush pushes a waiting save immediately and reports success', async () => {
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    setJSON('guide-progress', { '/react': { status: 'completed', lastVisited: '2026-10-14' } });
    const done = engine.flush(1000);
    await vi.advanceTimersByTimeAsync(10);
    expect(await done).toBe(true);
    expect(remote.docs.get('guide-progress')).toEqual({ '/react': { status: 'completed', lastVisited: '2026-10-14' } });
  });

  it('remembers the agreed value per account, so a different account starts from a union', async () => {
    setJSON('bookmarks', [bm('a')]);
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    expect(safeGet('sync-base')).toContain('"uid":"alice"');
    engine.stop();
    // Bob's account has nothing; with no base for Bob, alice's bookmark is not treated as deleted.
    engine = new SyncEngine('bob', remote = new FakeRemote(), (s) => states.push(s), 3000);
    engine.start();
    await vi.advanceTimersByTimeAsync(10);
    expect(remote.docs.get('bookmarks')).toEqual([bm('a')]);
  });

  it('a key missing on this device never wipes the account copy, even with a base', async () => {
    setJSON('bookmarks', [bm('a'), bm('b')]);
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    engine.stop();
    window.localStorage.removeItem('bookmarks');
    startEngine();
    await vi.advanceTimersByTimeAsync(10);
    expect(remote.docs.get('bookmarks')).toEqual([bm('a'), bm('b')]);
    expect(getJSON('bookmarks', [])).toEqual([bm('a'), bm('b')]);
  });

  it('removeSyncedProgress clears every synced key and the base, and nothing else', () => {
    setJSON('bookmarks', [bm('a')]);
    setJSON('sync-base', { uid: 'alice', values: {} });
    setJSON('theme', 'dark');
    removeSyncedProgress();
    expect(safeGet('bookmarks')).toBeNull();
    expect(safeGet('sync-base')).toBeNull();
    expect(safeGet('theme')).toBe('"dark"');
  });
});
