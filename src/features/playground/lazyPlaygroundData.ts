import type { AnyExplanation } from '../../data/playground/playgroundExplanations';

// The two big playground data modules, each loaded on first use and cached.
// Moved out of CodePlayground (held at a line ceiling). Type-only import above:
// a value import would put the whole explanations module in the route chunk.

// Explanation module shares the same lazy-cache pattern as solutions —
// the data itself is small now but will grow as more challenges get
// step-by-step explanations.
let explanationsCache: Record<string, AnyExplanation> | null = null;
export async function loadExplanations(): Promise<Record<string, AnyExplanation>> {
  if (explanationsCache) return explanationsCache;
  const mod = await import('../../data/playground/playgroundExplanations');
  explanationsCache = mod.playgroundExplanations;
  return explanationsCache;
}

// Solutions module is dynamically imported on first "Show Solution" click —
// keeps ~50 KB of solution-body strings out of the playground's initial chunk.
// Cached after first load so subsequent toggles are instant.
let solutionsCache: Record<string, string> | null = null;
export async function loadSolutions(): Promise<Record<string, string>> {
  if (solutionsCache) return solutionsCache;
  const mod = await import('../../data/playground/playgroundSolutions');
  solutionsCache = mod.playgroundSolutions;
  return solutionsCache;
}


