/**
 * The problem statement shown above the editor for a challenge, and the one-line
 * summary shown in the Challenges list.
 *
 * The statements are bulk data (~150 KB), so they load on demand, like the
 * template bodies and solutions: this module is the small, eagerly-imported
 * type + loader, and `challengeProblems.ts` holds the data.
 */

export interface ChallengeExample {
  /** What the user is given: arguments for a function, or an action for a UI. */
  input: string;
  /** What should come out: the printed result, or what appears on screen. */
  output: string;
  explanation?: string;
  /**
   * JS challenges only: a snippet that calls the reference solution and prints
   * exactly `output`. Never shown; `challengeProblems.test.ts` runs every one, so
   * a sample output in the problem panel cannot be wrong.
   */
  run?: string;
}

export interface ChallengeProblem {
  summary: string;
  statement: string;
  examples: ChallengeExample[];
  constraints?: string[];
}

let cache: Record<string, ChallengeProblem> | null = null;
let pending: Promise<Record<string, ChallengeProblem>> | null = null;

export function loadChallengeProblems(): Promise<Record<string, ChallengeProblem>> {
  if (cache) return Promise.resolve(cache);
  pending ??= import('./challengeProblems').then((m) => {
    cache = m.challengeProblems;
    return cache;
  });
  return pending;
}

/** Synchronous read once loaded, so a re-render never flashes a loading state. */
export function peekChallengeProblems(): Record<string, ChallengeProblem> | null {
  return cache;
}
