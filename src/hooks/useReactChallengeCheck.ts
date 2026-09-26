import { useCallback, useState } from 'react';
import { describeCheckResults, runReactChecks } from '../lib/reactChecks';

/**
 * "Check" for React machine-coding challenges: run the challenge's behaviour
 * script (src/data/playground/reactChecks.ts) against the live preview. The
 * checks module loads on first use.
 */
export function useReactChallengeCheck(opts: {
  previewRoot: () => HTMLElement | null;
  hasElement: () => boolean;
  remount: () => Promise<void>;
  onLines: (lines: string[], keep?: number) => void;
  /** How many console lines exist now, so the checks' own re-run logs can be dropped. */
  logCount: () => number;
  onAllPassed: (name: string) => void;
}) {
  const [checking, setChecking] = useState(false);
  const { previewRoot, hasElement, remount, onLines, logCount, onAllPassed } = opts;

  const check = useCallback(async (name: string): Promise<void> => {
    const root = previewRoot();
    if (!root || !hasElement()) { onLines(['🧪 Run your component first: Check drives the live preview.']); return; }
    setChecking(true);
    try {
      const { reactChecks } = await import('../data/playground/reactChecks');
      const checks = reactChecks[name];
      if (!checks?.length) { onLines(['🧪 This challenge has no behaviour checks yet.']); return; }
      const before = logCount();
      const results = await runReactChecks(root, checks, remount);
      onLines(describeCheckResults(results), before);
      if (results.every((r) => r.passed)) onAllPassed(name);
    } catch (e) {
      onLines([`🧪 The checks could not run: ${e instanceof Error ? e.message : String(e)}`]);
    } finally {
      setChecking(false);
    }
  }, [previewRoot, hasElement, remount, onLines, logCount, onAllPassed]);

  return { check, checking };
}
