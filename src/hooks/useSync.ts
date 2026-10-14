import { useCallback, useEffect, useRef, useState } from 'react';
import { createFirestoreRemote } from '../lib/firestoreRemote';
import { SyncEngine, type SyncState } from '../lib/syncEngine';

export interface UseSyncReturn {
  /** Null while the database SDK loads, or when nobody is signed in. */
  state: SyncState | null;
  /** Push everything now; true when the account holds all of this device's progress. */
  flush: () => Promise<boolean>;
  /** Stop syncing at once (before signing out, so nothing more is read or written). */
  stop: () => void;
}

/** Runs the sync engine while `uid` is signed in. */
export function useSync(uid: string | null): UseSyncReturn {
  const engine = useRef<SyncEngine | null>(null);
  // Keyed by uid, so a previous account's state is never shown for the next one.
  const [current, setCurrent] = useState<{ uid: string; state: SyncState } | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    let started: SyncEngine | null = null;
    createFirestoreRemote(uid)
      .then((remote) => {
        if (cancelled) return;
        started = new SyncEngine(uid, remote, (state) => setCurrent({ uid, state }));
        engine.current = started;
        started.start();
      })
      .catch(() => setCurrent({ uid, state: { status: 'error', addedLocalProgress: false } }));
    return () => {
      cancelled = true;
      started?.stop();
      if (engine.current === started) engine.current = null;
    };
  }, [uid]);

  const flush = useCallback(() => engine.current?.flush() ?? Promise.resolve(false), []);
  const stop = useCallback(() => {
    engine.current?.stop();
    engine.current = null;
  }, []);

  return { state: uid && current?.uid === uid ? current.state : null, flush, stop };
}
