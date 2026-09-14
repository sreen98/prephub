import type { AnyExplanation, BuildExplanation } from './playgroundExplanations';

/**
 * Which walkthrough an explanation wants.
 *
 * This lives in its own module, away from the explanation bodies, for the same
 * reason `playgroundExplanationKeys.ts` does: `playgroundExplanations.ts` is
 * ~10,600 lines and is meant to arrive only when the user opens the modal.
 * Importing this guard from there makes `ExplanationModal` a static consumer of
 * the whole thing — measured at the time as taking the playground chunk from
 * 100 KB to 635 KB. The import above is `import type`, so it erases at build
 * time and nothing follows it into the bundle.
 */
export function isBuildExplanation(e: AnyExplanation): e is BuildExplanation {
  return 'kind' in e && e.kind === 'build';
}
