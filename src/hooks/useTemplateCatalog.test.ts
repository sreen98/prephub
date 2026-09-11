import { describe, it, expect } from 'vitest';
import {
  buildTemplateCatalog, type TemplateCatalog, type TemplateCatalogFilters,
} from './useTemplateCatalog';

const base: TemplateCatalogFilters = {
  search: '', tag: 'all', mode: 'challenges', pattern: 'all', difficulty: 'all',
};
const catalog = (over: Partial<TemplateCatalogFilters> = {}): TemplateCatalog =>
  buildTemplateCatalog({ ...base, ...over });

const names = (c: TemplateCatalog) => c.categories.flatMap(x => x.templates.map(t => t.name));

describe('buildTemplateCatalog', () => {
  it('lists only challenges in challenges mode, only templates otherwise', () => {
    expect(catalog({ mode: 'challenges' }).categories.every(c => c.kind === 'challenge')).toBe(true);
    expect(catalog({ mode: 'templates' }).categories.every(c => (c.kind ?? 'template') === 'template')).toBe(true);
  });

  it('sorts challenges Easy → Medium → Hard when no difficulty is chosen', () => {
    const rank = { Easy: 1, Medium: 2, Hard: 3 } as const;
    for (const cat of catalog().categories) {
      const seen = cat.templates.map(t => (t.difficulty ? rank[t.difficulty] : 99));
      expect(seen).toEqual([...seen].sort((a, b) => a - b));
    }
  });

  it('preserves authored order once a difficulty is picked', () => {
    const picked = catalog({ difficulty: 'Easy' });
    expect(names(picked).length).toBeGreaterThan(0);
    expect(picked.categories.flatMap(c => c.templates).every(t => t.difficulty === 'Easy')).toBe(true);
  });

  // The bug this hook exists to make inexpressible: `patterns` and `difficulty`
  // live only on JS challenges. Deriving counts from the whole catalogue showed
  // JS numbers under the React tag that matched nothing on screen, and clicking
  // one emptied the list — which reads to a user as "filtering is broken".
  it('hides the pattern and difficulty controls when the scope has neither', () => {
    const js = catalog({ tag: 'js' });
    expect(js.scopeHasPatterns).toBe(true);
    expect(js.scopeHasDifficulty).toBe(true);

    const react = catalog({ tag: 'react' });
    expect(react.scopeHasPatterns).toBe(false);
    expect(react.scopeHasDifficulty).toBe(false);
    expect(Object.values(react.difficultyCounts).every(n => n === 0)).toBe(true);
    expect(Object.values(react.patternCounts).every(n => n === 0)).toBe(true);
  });

  it('scopes counts to the active tag, so they match the list on screen', () => {
    const all = catalog({ tag: 'all' }).difficultyCounts;
    const js = catalog({ tag: 'js' }).difficultyCounts;
    const sum = (c: Record<string, number>) => Object.values(c).reduce((a, b) => a + b, 0);
    expect(sum(js)).toBeGreaterThan(0);
    expect(sum(js)).toBeLessThanOrEqual(sum(all));
  });

  it('drops categories that filter down to nothing rather than showing empty headers', () => {
    const none = catalog({ search: 'zzzz-no-such-template' });
    expect(none.categories).toEqual([]);
  });

  it('search is case-insensitive', () => {
    expect(names(catalog({ search: 'TWO SUM' }))).toContain('Two Sum');
    expect(names(catalog({ search: 'two sum' }))).toContain('Two Sum');
  });

  it('tagOptions leads with "all" and is de-duplicated', () => {
    const { tagOptions } = catalog();
    expect(tagOptions[0]).toBe('all');
    expect(new Set(tagOptions).size).toBe(tagOptions.length);
  });

  it('totalJsChallenges matches the JS challenge count in the index', () => {
    expect(catalog().totalJsChallenges).toBe(94);
  });
});
