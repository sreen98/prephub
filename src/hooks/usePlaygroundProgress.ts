import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'playground-progress' as const;
const LAST_SESSION_KEY = 'playground-last-session' as const;

export interface ProgressEntry {
  code: string;
  notes?: string;
  status: 'in-progress' | 'solved';
  updatedAt: string;
  solvedAt?: string;
}

export type Progress = Record<string, ProgressEntry>;

export interface UsePlaygroundProgressReturn {
  progress: Progress;
  getEntry: (name: string) => ProgressEntry | null;
  saveEntry: (name: string, patch: Partial<ProgressEntry>) => void;
  markSolved: (name: string) => void;
  clearEntry: (name: string) => void;
  clearAll: () => void;
  solvedCount: number;
  inProgressCount: number;
  lastSessionName: string | null;
  setLastSession: (name: string) => void;
  clearLastSession: () => void;
}

function load(): Progress {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || {}; }
  catch { return {}; }
}

export function usePlaygroundProgress(): UsePlaygroundProgressReturn {
  const [progress, setProgress] = useState<Progress>(load);
  const [lastSessionName, setLastSessionState] = useState<string | null>(
    () => localStorage.getItem(LAST_SESSION_KEY) || null
  );

  const save = useCallback((next: Progress): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProgress(next);
  }, []);

  const getEntry = useCallback((name: string): ProgressEntry | null => {
    return progress[name] ?? null;
  }, [progress]);

  // Shallow-merge a patch into the entry; always bumps updatedAt.
  // Reads the latest persisted state so two saves in quick succession don't drop fields.
  const saveEntry = useCallback((name: string, patch: Partial<ProgressEntry>): void => {
    if (!name) return;
    const current = load();
    const existing = current[name] ?? { code: '', status: 'in-progress' as const, updatedAt: new Date().toISOString() };
    const merged: ProgressEntry = {
      ...existing,
      ...patch,
      // Patch can't overwrite the auto-bumped timestamp.
      updatedAt: new Date().toISOString(),
    };
    save({ ...current, [name]: merged });
  }, [save]);

  const markSolved = useCallback((name: string): void => {
    if (!name) return;
    const current = load();
    const existing = current[name];
    if (existing?.status === 'solved') return;  // already solved — don't bump solvedAt
    const merged: ProgressEntry = {
      code: existing?.code ?? '',
      notes: existing?.notes,
      status: 'solved',
      updatedAt: new Date().toISOString(),
      solvedAt: existing?.solvedAt ?? new Date().toISOString(),
    };
    save({ ...current, [name]: merged });
  }, [save]);

  const clearEntry = useCallback((name: string): void => {
    const current = load();
    if (!(name in current)) return;
    const { [name]: _removed, ...rest } = current;
    save(rest);
  }, [save]);

  const clearAll = useCallback((): void => save({}), [save]);

  const setLastSession = useCallback((name: string): void => {
    if (!name) return;
    localStorage.setItem(LAST_SESSION_KEY, name);
    setLastSessionState(name);
  }, []);

  const clearLastSession = useCallback((): void => {
    localStorage.removeItem(LAST_SESSION_KEY);
    setLastSessionState(null);
  }, []);

  const { solvedCount, inProgressCount } = useMemo(() => {
    let s = 0, ip = 0;
    for (const entry of Object.values(progress)) {
      if (entry.status === 'solved') s++;
      else ip++;
    }
    return { solvedCount: s, inProgressCount: ip };
  }, [progress]);

  return {
    progress,
    getEntry,
    saveEntry,
    markSolved,
    clearEntry,
    clearAll,
    solvedCount,
    inProgressCount,
    lastSessionName,
    setLastSession,
    clearLastSession,
  };
}
