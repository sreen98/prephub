import { SYNCED_KEYS, type SyncedKey } from './syncKeys';
import { deepEqual, isRecord, mergeSyncedValue } from './syncMerge';
import { getJSON, onSyncedWrite, safeRemove, safeSet, setJSONFromSync } from './storage';

/**
 * Keeps this device's synced keys and the signed-in account in step
 * (docs/accounts-and-sync-plan.md, phase 3).
 *
 * localStorage stays the source of truth on the device: the app never waits
 * for the network. Each synced key is one remote document. Two things move data:
 *  - a remote snapshot (first load, or another device's change) is merged into
 *    localStorage at once, and pushed back if the merge added anything;
 *  - a local save is pushed a few seconds later, so a burst of saves costs one write.
 * Every push is a read-merge-write transaction, so two devices pushing at once
 * cannot overwrite each other's changes.
 *
 * The merge is three-way (lib/syncMerge.ts). Its base, the value both sides last
 * agreed on, is kept per account in `sync-base`.
 *
 * The engine only knows the RemoteStore interface; lib/firestoreRemote.ts is the
 * Firebase implementation, and the tests use an in-memory one.
 */
export interface RemoteStore {
  /** Calls `onValue` with the stored value, or undefined when there is none, now and on every change. */
  subscribe(key: SyncedKey, onValue: (value: unknown) => void, onError: (err: unknown) => void): () => void;
  /**
   * Atomically read the current value, pass it to `compute`, and store the
   * result. `compute` may run more than once; returning undefined writes nothing.
   */
  update(key: SyncedKey, compute: (current: unknown) => unknown): Promise<void>;
}

export type SyncStatus = 'connecting' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  /** The first sync on this device added progress the account did not have. */
  addedLocalProgress: boolean;
}

const BASE_KEY = 'sync-base';
const RETRY_MS = 30_000;

function readLocal(key: SyncedKey): unknown {
  return getJSON<unknown>(key, undefined);
}

function readBases(uid: string): Record<string, unknown> {
  const stored = getJSON<unknown>(BASE_KEY, null);
  return isRecord(stored) && stored.uid === uid && isRecord(stored.values) ? stored.values : {};
}

/** After deleting the account copy: nothing is agreed with it any more. */
export function forgetSyncBase(): void {
  safeRemove(BASE_KEY);
}

/** The reader chose "Remove it from this device" when signing out. */
export function removeSyncedProgress(): void {
  for (const key of SYNCED_KEYS) safeRemove(key);
  safeRemove(BASE_KEY);
}

function isOffline(err: unknown): boolean {
  const code = isRecord(err) && typeof err.code === 'string' ? err.code : '';
  return code === 'unavailable' || code === 'deadline-exceeded' || (typeof navigator !== 'undefined' && navigator.onLine === false);
}

export class SyncEngine {
  private readonly stops: (() => void)[] = [];
  private readonly timers = new Map<SyncedKey, ReturnType<typeof setTimeout>>();
  private readonly inflight = new Map<SyncedKey, Promise<void>>();
  private readonly received = new Set<SyncedKey>();
  private failure: 'offline' | 'error' | null = null;
  private addedLocalProgress = false;
  private stopped = false;

  constructor(
    private readonly uid: string,
    private readonly remote: RemoteStore,
    private readonly onChange: (state: SyncState) => void,
    private readonly debounceMs = 3000,
  ) {}

  start(): void {
    this.stops.push(onSyncedWrite((key, fromSync) => {
      if (!fromSync) this.schedule(key, this.debounceMs);
    }));
    for (const key of SYNCED_KEYS) {
      this.stops.push(this.remote.subscribe(key, (v) => this.onRemote(key, v), (err) => this.fail(err)));
    }
    if (typeof window !== 'undefined') {
      const online = (): void => this.retryAll();
      window.addEventListener('online', online);
      this.stops.push(() => window.removeEventListener('online', online));
    }
    this.emit();
  }

  stop(): void {
    this.stopped = true;
    for (const stop of this.stops.splice(0)) stop();
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  }

  get state(): SyncState {
    let status: SyncStatus = 'synced';
    if (this.failure) status = this.failure;
    else if (this.received.size < SYNCED_KEYS.length) status = 'connecting';
    else if (this.timers.size > 0 || this.inflight.size > 0) status = 'syncing';
    return { status, addedLocalProgress: this.addedLocalProgress };
  }

  /**
   * Push everything now and wait. True when the account holds all of this
   * device's progress, so removing it from the device loses nothing.
   */
  async flush(timeoutMs = 10_000): Promise<boolean> {
    for (const [key, timer] of [...this.timers]) {
      clearTimeout(timer);
      this.timers.delete(key);
      this.enqueue(key);
    }
    const settled = Promise.allSettled([...this.inflight.values()]);
    const timedOut = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));
    if ((await Promise.race([settled, timedOut])) === 'timeout') return false;
    return this.state.status === 'synced';
  }

  /**
   * The agreed value to merge against. A key missing on this device has no base:
   * against a base, a missing key would read as "every entry was deleted here"
   * and wipe the account copy, so it merges as a plain union instead.
   */
  private base(key: SyncedKey, local: unknown): unknown {
    return local === undefined ? undefined : readBases(this.uid)[key];
  }

  private setBase(key: SyncedKey, value: unknown): void {
    safeSet(BASE_KEY, JSON.stringify({ uid: this.uid, values: { ...readBases(this.uid), [key]: value } }));
  }

  private onRemote(key: SyncedKey, remote: unknown): void {
    if (this.stopped) return;
    this.received.add(key);
    const local = readLocal(key);
    if (local !== undefined || remote !== undefined) {
      const base = this.base(key, local);
      const merged = mergeSyncedValue(key, base, local, remote);
      if (!deepEqual(merged, local)) setJSONFromSync(key, merged);
      if (deepEqual(merged, remote)) {
        this.setBase(key, merged);
      } else {
        if (base === undefined && local !== undefined) this.addedLocalProgress = true;
        this.schedule(key, 0);
      }
    }
    this.emit();
  }

  private schedule(key: SyncedKey, delayMs: number): void {
    if (this.stopped) return;
    const pending = this.timers.get(key);
    if (pending !== undefined) clearTimeout(pending);
    this.timers.set(key, setTimeout(() => {
      this.timers.delete(key);
      this.enqueue(key);
    }, delayMs));
    this.emit();
  }

  /** One push per key at a time; a later change queues behind the running one. */
  private enqueue(key: SyncedKey): void {
    const run = (this.inflight.get(key) ?? Promise.resolve()).then(() => this.push(key));
    this.inflight.set(key, run);
    void run.finally(() => {
      if (this.inflight.get(key) === run) this.inflight.delete(key);
      this.emit();
    });
  }

  private async push(key: SyncedKey): Promise<void> {
    if (this.stopped) return;
    let merged: unknown;
    try {
      await this.remote.update(key, (current) => {
        const local = readLocal(key);
        merged = local === undefined && current === undefined ? undefined : mergeSyncedValue(key, this.base(key, local), local, current);
        return merged === undefined || deepEqual(merged, current) ? undefined : merged;
      });
      this.failure = null;
      if (this.stopped || merged === undefined) return;
      if (!deepEqual(merged, readLocal(key))) setJSONFromSync(key, merged);
      this.setBase(key, merged);
    } catch (err) {
      this.fail(err);
      this.schedule(key, RETRY_MS);
    }
  }

  private retryAll(): void {
    if (this.failure === null) return;
    this.failure = null;
    for (const key of SYNCED_KEYS) this.schedule(key, 0);
  }

  private fail(err: unknown): void {
    this.failure = isOffline(err) ? 'offline' : 'error';
    this.emit();
  }

  private emit(): void {
    if (!this.stopped) this.onChange(this.state);
  }
}
