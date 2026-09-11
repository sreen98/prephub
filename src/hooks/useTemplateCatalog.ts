/**
 * Everything the template picker *displays*, derived from the filter state.
 *
 * This lived inside `CodePlayground` as seven `useMemo`s, which is why none of
 * it could be tested: exercising "does the React tag hide the pattern sidebar?"
 * meant mounting a component that also boots an editor, a Worker and a preview
 * root. It is pure derivation over the template index, so it belongs here.
 *
 * The scope-awareness is the part worth understanding. `patterns` and
 * `difficulty` exist only on JS coding challenges — React machine-coding
 * templates carry neither. Deriving the counts from the *whole* catalogue while
 * the React tag was selected showed JS numbers that matched nothing on screen,
 * and clicking one filtered every result away, which reads as "filtering is
 * broken". So every count below is scoped to the active tag, and
 * `scopeHasPatterns` / `scopeHasDifficulty` decide whether those controls
 * render at all.
 */
import { useMemo } from 'react';
import type { Pattern, Difficulty } from '../data/playground/playgroundTemplates';
import {
  ALL_PATTERNS,
  templateCategories,
  allTemplates,
  type TemplateMeta,
  type CategoryMeta,
} from '../data/playground/templateIndex';
import type { ModalMode } from './useTemplateFilters';

export interface TemplateCatalogFilters {
  search: string;
  tag: string;
  mode: ModalMode;
  pattern: Pattern | 'all';
  difficulty: Difficulty | 'all';
}

export interface TemplateCatalog {
  /** Categories with their templates filtered, empty ones dropped. */
  categories: CategoryMeta[];
  /** `['all', ...lowercased tags]` for the filter pills. */
  tagOptions: string[];
  /** Drives the "X / Y solved" header chip. */
  totalJsChallenges: number;
  difficultyCounts: Record<Difficulty, number>;
  patternCounts: Record<Pattern, number>;
  scopeHasPatterns: boolean;
  scopeHasDifficulty: boolean;
}

/** Easy → Medium → Hard. Anything untagged sorts last. */
const DIFFICULTY_RANK: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

/**
 * The whole derivation as a pure function — no React, so it is testable the way
 * `templateFilterReducer` is, without pulling a DOM testing library into the
 * dev dependencies. `useTemplateCatalog` below is just the memoised wrapper.
 */
export function buildTemplateCatalog(filters: TemplateCatalogFilters): TemplateCatalog {
  const { search, tag, mode, pattern, difficulty } = filters;
  const wantedKind = mode === 'challenges' ? 'challenge' : 'template';
  const needle = search.toLowerCase();

  const categories = templateCategories
    .filter(cat => (cat.kind ?? 'template') === wantedKind)
    .filter(cat => tag === 'all' || cat.tag.toLowerCase() === tag)
    .map(cat => {
      const matched = cat.templates.filter(t => {
        if (!t.name.toLowerCase().includes(needle)) return false;
        if (pattern !== 'all' && !t.patterns?.includes(pattern)) return false;
        if (difficulty !== 'all' && t.difficulty !== difficulty) return false;
        return true;
      });
      // With no explicit difficulty chosen, challenges read best easiest-first.
      // Every other mode preserves the authored order.
      if (difficulty !== 'all' || mode !== 'challenges') return { ...cat, templates: matched };
      const sorted = [...matched].sort(
        (a, b) => (a.difficulty ? DIFFICULTY_RANK[a.difficulty] : 99)
                - (b.difficulty ? DIFFICULTY_RANK[b.difficulty] : 99),
      );
      return { ...cat, templates: sorted };
    })
    .filter(cat => cat.templates.length > 0);

  // Challenges left after the tag filter — the denominator for every count below.
  const inScope: TemplateMeta[] = templateCategories
    .filter(cat => (cat.kind ?? 'template') === 'challenge')
    .filter(cat => tag === 'all' || cat.tag.toLowerCase() === tag)
    .flatMap(cat => cat.templates);

  const difficultyCounts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const t of inScope) if (t.difficulty) difficultyCounts[t.difficulty]++;

  const patternCounts = Object.fromEntries(ALL_PATTERNS.map(p => [p, 0])) as Record<Pattern, number>;
  for (const t of inScope) for (const p of t.patterns ?? []) patternCounts[p] = (patternCounts[p] || 0) + 1;

  return {
    categories,
    tagOptions: ['all', ...new Set(templateCategories.map(c => c.tag.toLowerCase()))],
    totalJsChallenges: allTemplates.filter(t => t.kind === 'challenge' && t.tag === 'JS').length,
    difficultyCounts,
    patternCounts,
    scopeHasPatterns: inScope.some(t => t.patterns !== undefined && t.patterns.length > 0),
    scopeHasDifficulty: inScope.some(t => Boolean(t.difficulty)),
  };
}

export function useTemplateCatalog(filters: TemplateCatalogFilters): TemplateCatalog {
  const { search, tag, mode, pattern, difficulty } = filters;
  return useMemo(
    () => buildTemplateCatalog({ search, tag, mode, pattern, difficulty }),
    [search, tag, mode, pattern, difficulty],
  );
}
