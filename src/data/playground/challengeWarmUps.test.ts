import { describe, it, expect } from 'vitest';
import { challengeProblems } from './challengeProblems';
import { challengeTracks } from './challengeTracks';
import { allTemplates } from './templateIndex';
import { warmUpOf } from './challengeProblemIndex';

/**
 * Near-duplicate challenges (Modal Component and Modal with a focus trap,
 * Notifications and Toast) are kept as a pair: the smaller one names the fuller
 * one in `warmUpFor`, and both show the pairing in the list and the Problem
 * panel. Kept rather than removed, because solved state and drafts are keyed by
 * the challenge name.
 */
describe('warm-up pairs', () => {
  const byName = new Map(allTemplates.filter((t) => t.kind === 'challenge').map((t) => [t.name, t]));
  const pairs = Object.entries(challengeProblems).flatMap(([n, p]) => (p.warmUpFor ? [[n, p.warmUpFor] as const] : []));

  it('every pair links two real challenges of the same kind, one step deep', () => {
    expect(pairs.length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const [warm, full] of pairs) {
      const a = byName.get(warm), b = byName.get(full);
      if (!a || !b) { bad.push(`${warm} → ${full}: not a challenge`); continue; }
      if (warm === full) bad.push(`${warm}: points at itself`);
      if (a.tag !== b.tag) bad.push(`${warm} → ${full}: JS and React mixed`);
      if (challengeProblems[full].warmUpFor) bad.push(`${full}: is a warm-up and has one (chain)`);
      if (warmUpOf(challengeProblems, full) !== warm) bad.push(`${full}: has more than one warm-up`);
    }
    expect(bad).toEqual([]);
  });

  it('in every track holding both, the warm-up comes first', () => {
    const wrong: string[] = [];
    for (const [warm, full] of pairs) {
      for (const t of challengeTracks) {
        const i = t.names.indexOf(warm), j = t.names.indexOf(full);
        if (i >= 0 && j >= 0 && i > j) wrong.push(`${t.title}: ${full} before ${warm}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});
