import { useState, useCallback, useMemo } from 'react';
import { getJSON, setJSON, safeGet, safeSet, safeRemove } from '../lib/storage';
import { FLAVORS, lastSessionFor, type PlaygroundFlavor } from '../lib/playgroundFlavor';
import { stripChallengeHeader } from '../lib/challengeHeader';

const STORAGE_KEY = 'playground-progress' as const;
const LAST_SESSION_KEY = 'playground-last-session' as const;

export interface ProgressEntry {
  code: string;
  /**
   * Hash of the template code this draft started from.
   *
   * Without it a draft pins whatever the template said the day it was opened.
   * The autosave fires 800ms after a template loads, so simply OPENING a
   * challenge stores a copy — and when the template is later corrected, that
   * stale copy silently wins and the reader keeps seeing the bug that was
   * fixed. Comparing this against the current template tells us whether the
   * template moved; comparing it against the saved code tells us whether the
   * reader ever actually typed anything.
   */
  baseHash?: string;
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
  setSolved: (name: string, solved: boolean) => void;
  clearEntry: (name: string) => void;
  clearAll: () => void;
  solvedCount: number;
  inProgressCount: number;
  lastSessionName: string | null;
  setLastSession: (name: string) => void;
  clearLastSession: () => void;
}

/**
 * Pure transition for the completion toggle — split out so it can be tested in
 * plain Node, the same way `buildTemplateCatalog` is. The repo has no
 * @testing-library/react, and the hooks lint rule rejects the capture-the-
 * result-of-a-render trick, so pure-function-plus-thin-hook is the shape that
 * is actually testable here.
 *
 * Two rules it encodes:
 *  - un-marking PRESERVES code and notes. Undoing a mis-click must not delete
 *    an afternoon of work, which is why this is not `clearEntry`.
 *  - `solvedAt` survives re-marking something already solved, so re-running a
 *    passing challenge does not rewrite when you solved it — but completing
 *    again AFTER an un-mark is a new event and gets a new timestamp.
 *
 * The injectable clock is load-bearing: the first version of this test used
 * the real one and passed vacuously, because both timestamps landed in the
 * same millisecond.
 */
export function applySolved(
  progress: Progress,
  name: string,
  solved: boolean,
  now: string = new Date().toISOString(),
): Progress {
  if (!name) return progress;
  const existing = progress[name];
  // Nothing to un-mark on a template that was never opened.
  if (!solved && !existing) return progress;
  const next: ProgressEntry = {
    code: existing?.code ?? '',
    notes: existing?.notes,
    status: solved ? 'solved' : 'in-progress',
    updatedAt: now,
    solvedAt: solved ? (existing?.solvedAt ?? now) : undefined,
  };
  return { ...progress, [name]: next };
}

/** FNV-1a. Not cryptographic — just a cheap, stable fingerprint for a string. */
export function hashCode(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export interface OpenResolution {
  code: string;
  /** True when we handed back the reader's own work rather than the template. */
  restored: boolean;
  /** The template changed under a draft the reader HAS edited. */
  templateUpdated: boolean;
}

/**
 * Decide what the editor shows when a challenge is opened.
 *
 * The rule that matters: a draft the reader never modified must not outrank a
 * corrected template. There is nothing to lose by replacing it, and keeping it
 * means a fixed template stays broken for exactly the people who opened it
 * before the fix.
 *
 * Entries saved before `baseHash` existed cannot be told apart from edited
 * ones, so they keep the old behaviour — the reader's copy wins, and Reset is
 * the way out.
 */
export function resolveOpenCode(saved: ProgressEntry | null, stub: string): OpenResolution {
  if (!saved?.code || saved.code === stub) {
    return { code: stub, restored: false, templateUpdated: false };
  }
  const templateMoved = saved.baseHash !== undefined && saved.baseHash !== hashCode(stub);
  const untouched = saved.baseHash !== undefined && hashCode(saved.code) === saved.baseHash;
  if (templateMoved && untouched) {
    return { code: stub, restored: false, templateUpdated: false };
  }
  return { code: saved.code, restored: true, templateUpdated: templateMoved };
}

/**
 * Drafts saved before the challenge headers were removed still start with the
 * old problem-restating comment block (see lib/challengeHeader). Strip it on
 * read, so an edited draft loses the duplicate but keeps everything the user
 * wrote. The next autosave persists the stripped copy.
 */
function load(): Progress {
  const raw = getJSON<Progress>(STORAGE_KEY, {});
  const out: Progress = {};
  for (const [name, entry] of Object.entries(raw)) {
    out[name] = entry && typeof entry.code === 'string' ? { ...entry, code: stripChallengeHeader(entry.code) } : entry;
  }
  return out;
}

/**
 * `flavor` picks which playground's "last open template" this reads and writes;
 * drafts and solved state are shared, because a template belongs to one flavor
 * anyway. Omitted, it is the original single key.
 */
export function usePlaygroundProgress(flavor?: PlaygroundFlavor): UsePlaygroundProgressReturn {
  const lastSessionKey = flavor ? FLAVORS[flavor].lastSessionKey : LAST_SESSION_KEY;
  const [progress, setProgress] = useState<Progress>(load);
  const [lastSessionName, setLastSessionState] = useState<string | null>(
    () => (flavor ? lastSessionFor(flavor) : safeGet(LAST_SESSION_KEY))
  );

  const save = useCallback((next: Progress): void => {
    setJSON(STORAGE_KEY, next);
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
      // Pinned to the FIRST save, which is the template as it was when they
      // opened it. A later patch must not move the baseline.
      baseHash: existing.baseHash ?? patch.baseHash,
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

  /**
   * Explicit completion toggle.
   *
   * `markSolved` is the automatic path and only fires for JS challenges, where
   * a run producing all ✅ is unambiguous. React machine-coding templates have
   * no test output to interpret, so before this they could not be completed at
   * all — this is how the user says so themselves, and un-says it.
   */
  const setSolved = useCallback((name: string, solved: boolean): void => {
    const current = load();
    const next = applySolved(current, name, solved);
    if (next !== current) save(next);
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
    safeSet(lastSessionKey, name);
    setLastSessionState(name);
  }, [lastSessionKey]);

  const clearLastSession = useCallback((): void => {
    safeRemove(lastSessionKey);
    setLastSessionState(null);
  }, [lastSessionKey]);

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
    setSolved,
    clearEntry,
    clearAll,
    solvedCount,
    inProgressCount,
    lastSessionName,
    setLastSession,
    clearLastSession,
  };
}
