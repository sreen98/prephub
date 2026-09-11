import { useState, useCallback, useEffect } from 'react';
import { safeGet, safeSet } from '../lib/storage';

const SPLIT_KEY = 'playground-split-pct';
const WRAP_KEY = 'playground-wrap';
const AUTOCLOSE_KEY = 'playground-bracket-autoclose';

/** Editor pane width is clamped to this range, on read and on drag. */
const MIN_PCT = 20;
const MAX_PCT = 80;
const DEFAULT_PCT = 50;

export interface UseEditorPrefsReturn {
  /** Editor pane width as a percentage of the split container (md+ only). */
  editorPct: number;
  setEditorPct: (pct: number) => void;
  wrapOn: boolean;
  toggleWrap: () => void;
  bracketAutoClose: boolean;
  toggleBracketAutoClose: () => void;
}

/**
 * The three editor preferences that persist across reloads, in one place.
 *
 * They were three separate `useState` initialisers plus two persistence
 * effects plus one inline write inside a toggle — five sites reading and
 * writing the same three keys from inside a 1,900-line component. Collecting
 * them means the clamping rule lives next to the value it protects, and the
 * keys appear exactly once each.
 */
export function useEditorPrefs(): UseEditorPrefsReturn {
  const [editorPct, setEditorPctState] = useState<number>(() => {
    const stored = parseFloat(safeGet(SPLIT_KEY) ?? '');
    return Number.isFinite(stored) && stored >= MIN_PCT && stored <= MAX_PCT ? stored : DEFAULT_PCT;
  });
  // Default ON: only an explicit '0' turns these off, so a first-time visitor
  // (no stored value) gets wrapping and auto-close.
  const [wrapOn, setWrapOn] = useState<boolean>(() => safeGet(WRAP_KEY) !== '0');
  const [bracketAutoClose, setBracketAutoClose] = useState<boolean>(
    () => safeGet(AUTOCLOSE_KEY) !== '0',
  );

  const setEditorPct = useCallback((pct: number) => {
    setEditorPctState(Math.max(MIN_PCT, Math.min(MAX_PCT, pct)));
  }, []);

  useEffect(() => { safeSet(SPLIT_KEY, String(editorPct)); }, [editorPct]);
  useEffect(() => { safeSet(WRAP_KEY, wrapOn ? '1' : '0'); }, [wrapOn]);
  useEffect(() => { safeSet(AUTOCLOSE_KEY, bracketAutoClose ? '1' : '0'); }, [bracketAutoClose]);

  return {
    editorPct,
    setEditorPct,
    wrapOn,
    toggleWrap: useCallback(() => setWrapOn((w) => !w), []),
    bracketAutoClose,
    toggleBracketAutoClose: useCallback(() => setBracketAutoClose((v) => !v), []),
  };
}
