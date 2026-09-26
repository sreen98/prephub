import { useSyncExternalStore } from 'react';
import {
  loadChallengeProblems, peekChallengeProblems, type ChallengeProblem,
} from '../data/playground/challengeProblemIndex';

/**
 * The challenge problem statements, loaded on first use. Read through
 * useSyncExternalStore rather than useState + useEffect: the data lives outside
 * React (a module-level cache), and subscribing is what starts the download.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!peekChallengeProblems()) {
    loadChallengeProblems()
      .then(() => listeners.forEach((l) => l()))
      .catch(() => { /* offline or a stale chunk: the panel simply shows nothing */ });
  }
  return () => listeners.delete(onChange);
}

export function useChallengeProblems(): Record<string, ChallengeProblem> | null {
  return useSyncExternalStore(subscribe, peekChallengeProblems, () => null);
}
