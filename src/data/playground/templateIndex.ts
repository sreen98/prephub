/**
 * The template modal's data source: metadata only, no code bodies.
 *
 * `playgroundTemplates.ts` is 360 KB and was statically imported, which is why
 * the playground chunk was 428 KB. The modal needs a name, tag, kind, category,
 * patterns and difficulty to list and filter; it needs a `code` body only when
 * someone actually opens a template. So the index (13 KB, generated) ships with
 * the route and the bodies arrive on demand — the same split already used for
 * `playgroundSolutionKeys.ts` and the lazy `playgroundSolutions.ts`.
 *
 * `src/generated/playground-index.json` is generated and gitignored; run
 * `npm run playground:index` (also run by `npm run dev` and `npm run build`).
 */
import indexJson from '../../generated/playground-index.json';
import type {
  Pattern, Difficulty, TemplateLang, CategoryKind, BlankStarter,
} from './playgroundTemplates';

/** A template as the modal sees it — everything except the code. */
export interface TemplateMeta {
  name: string;
  lang?: TemplateLang;
  jsx?: boolean;
  patterns?: Pattern[];
  difficulty?: Difficulty;
}

export interface CategoryMeta {
  label: string;
  tag: string;
  kind: CategoryKind;
  templates: TemplateMeta[];
}

/** Flattened, with the category fields folded in — mirrors `allTemplates`. */
export interface FlatTemplateMeta extends TemplateMeta {
  category: string;
  tag: string;
  kind: CategoryKind;
}

interface PlaygroundIndex {
  allPatterns: Pattern[];
  patternGroups: { label: string; patterns: Pattern[] }[];
  categories: CategoryMeta[];
  blankStarters: BlankStarter[];
}

const index = indexJson as PlaygroundIndex;

export const ALL_PATTERNS: Pattern[] = index.allPatterns;
export const PATTERN_GROUPS = index.patternGroups;
export const templateCategories: CategoryMeta[] = index.categories;
export const blankStarters: BlankStarter[] = index.blankStarters;

export const allTemplates: FlatTemplateMeta[] = index.categories.flatMap((cat) =>
  cat.templates.map((t) => ({ ...t, category: cat.label, tag: cat.tag, kind: cat.kind })),
);

// ---------------------------------------------------------------------------
// Code bodies — loaded once, on demand, and cached for the session.
// ---------------------------------------------------------------------------
let codeCache: Map<string, string> | null = null;
let inFlight: Promise<Map<string, string>> | null = null;

/** Fetch and cache every template body. Memoised, so it downloads once. */
export function loadTemplateCode(): Promise<Map<string, string>> {
  if (codeCache) return Promise.resolve(codeCache);
  inFlight ??= import('./playgroundTemplates').then((mod) => {
    const map = new Map<string, string>();
    for (const t of mod.allTemplates) map.set(t.name, t.code);
    codeCache = map;
    inFlight = null;
    return map;
  });
  return inFlight;
}

/** The code for one template, or undefined if the name is unknown. */
export async function getTemplateCode(name: string): Promise<string | undefined> {
  return (await loadTemplateCode()).get(name);
}

/** Synchronous peek — non-null only once the bodies have been downloaded. */
export function peekTemplateCode(name: string): string | undefined {
  return codeCache?.get(name);
}

/** True once the bodies are cached, so callers can skip a loading state. */
export function isTemplateCodeReady(): boolean {
  return codeCache !== null;
}

/**
 * Warm the cache without blocking anything. The template modal is the primary
 * way into the playground, so the bodies are almost always wanted — just not
 * before first paint.
 */
export function prefetchTemplateCode(): void {
  const start = () => { void loadTemplateCode(); };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 500);
}
