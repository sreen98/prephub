import { describe, it, expect } from 'vitest';
import { allTemplates as fullTemplates, templateCategories, blankStarters } from './playgroundTemplates';
import { allTemplates as indexTemplates, getTemplateCode, loadTemplateCode } from './templateIndex';
import { playgroundSolutionKeys } from './playgroundSolutionKeys';
import { playgroundExplanationKeys } from './playgroundExplanationKeys';

/**
 * Census of the playground's content.
 *
 * The template bodies were split away from their metadata so the 360 KB of
 * code could load on demand, and the modules then moved from src/components/
 * to src/data/playground/. Both are exactly the kind of change that can lose
 * content silently — a template that vanishes from the index is simply absent
 * from the picker, with nothing failing. These numbers are the census, and the
 * resolution checks prove nothing became unopenable.
 *
 * If a count here fails because content was deliberately added, update the
 * number. If it fails after a refactor, something was lost.
 */
const EXPECTED = {
  templates: 180,
  categories: 7,
  blankStarters: 3,
  jsChallenges: 94,
  reactChallenges: 35,
  referenceTemplates: 51,
  solutions: 94,
  explanations: 144,
};

const jsChallenges = fullTemplates.filter((t) => t.kind === 'challenge' && t.tag === 'JS');
const reactChallenges = fullTemplates.filter((t) => t.kind === 'challenge' && t.tag === 'React');

describe('playground census', () => {
  it(`has ${EXPECTED.templates} templates in ${EXPECTED.categories} categories`, () => {
    expect(fullTemplates.length).toBe(EXPECTED.templates);
    expect(templateCategories.length).toBe(EXPECTED.categories);
  });

  it(`has ${EXPECTED.jsChallenges} JS coding challenges`, () => {
    expect(jsChallenges.length).toBe(EXPECTED.jsChallenges);
  });

  it(`has ${EXPECTED.reactChallenges} React machine-coding challenges`, () => {
    expect(reactChallenges.length).toBe(EXPECTED.reactChallenges);
  });

  it(`has ${EXPECTED.referenceTemplates} non-challenge reference templates`, () => {
    expect(fullTemplates.filter((t) => t.kind !== 'challenge').length)
      .toBe(EXPECTED.referenceTemplates);
  });

  it(`keeps ${EXPECTED.blankStarters} blank starters`, () => {
    expect(blankStarters.length).toBe(EXPECTED.blankStarters);
  });

  it('every category is non-empty and correctly tagged', () => {
    for (const cat of templateCategories) {
      expect(cat.templates.length, cat.label).toBeGreaterThan(0);
      expect(cat.tag, cat.label).toBeTruthy();
      expect(['template', 'challenge'], cat.label).toContain(cat.kind ?? 'template');
    }
  });

  it('category totals add up to the flat list', () => {
    const summed = templateCategories.reduce((n, c) => n + c.templates.length, 0);
    expect(summed).toBe(fullTemplates.length);
  });
});

describe('every template survived the split and the move', () => {
  it('the metadata index lists exactly the same names, in order', () => {
    expect(indexTemplates.map((t) => t.name)).toEqual(fullTemplates.map((t) => t.name));
  });

  it('every template has a non-empty code body', () => {
    for (const t of fullTemplates) {
      expect(t.code, t.name).toBeTruthy();
      expect(t.code.trim().length, t.name).toBeGreaterThan(0);
    }
  });

  it('every name in the index resolves to its exact body on demand', async () => {
    const map = await loadTemplateCode();
    expect(map.size).toBe(fullTemplates.length);
    for (const t of fullTemplates) {
      expect(await getTemplateCode(t.name), t.name).toBe(t.code);
    }
  });

  it('no template body was truncated — template-literal escaping is intact', () => {
    // A mis-escaped backtick inside these `code:` literals silently truncates
    // the template, and `tsc` does NOT catch it because the remainder still
    // parses. Unbalanced braces or parens are the observable symptom.
    const suspects: string[] = [];
    for (const t of fullTemplates) {
      const net = (s: string, open: string, close: string) =>
        (s.split(open).length - 1) - (s.split(close).length - 1);
      // Strings and comments make exact balance impossible, so only flag a
      // wild imbalance, which is what truncation produces.
      if (Math.abs(net(t.code, '{', '}')) > 3 || Math.abs(net(t.code, '(', ')')) > 3) {
        suspects.push(t.name);
      }
    }
    expect(suspects).toEqual([]);
  });
});

describe('solutions and explanations still line up with the challenges', () => {
  it(`has ${EXPECTED.solutions} solution keys and ${EXPECTED.explanations} explanation keys`, () => {
    expect(playgroundSolutionKeys.size).toBe(EXPECTED.solutions);
    expect(playgroundExplanationKeys.size).toBe(EXPECTED.explanations);
  });

  it('every solution key names a real template', () => {
    const names = new Set(fullTemplates.map((t) => t.name));
    const orphans = [...playgroundSolutionKeys].filter((k) => !names.has(k));
    expect(orphans, 'a solution whose template no longer exists is unreachable').toEqual([]);
  });

  it('every explanation key names a real template', () => {
    const names = new Set(fullTemplates.map((t) => t.name));
    const orphans = [...playgroundExplanationKeys].filter((k) => !names.has(k));
    expect(orphans).toEqual([]);
  });

  it('solutions only ever attach to JS challenges', () => {
    const jsNames = new Set(jsChallenges.map((t) => t.name));
    const misplaced = [...playgroundSolutionKeys].filter((k) => !jsNames.has(k));
    expect(misplaced).toEqual([]);
  });

  it('every solution body is loadable and non-empty', async () => {
    const solutions = (await import('./playgroundSolutions')).playgroundSolutions;
    for (const key of playgroundSolutionKeys) {
      expect(solutions[key], key).toBeTruthy();
      expect(solutions[key].trim().length, key).toBeGreaterThan(0);
    }
  });

  /**
   * RATCHET — explanation depth.
   *
   * The house standard is 2+ approaches per explanation with a visual on every
   * step, and CLAUDE.md long claimed that was universally true. It was, for the
   * original 35 challenges; roughly 50 challenges added since came in with a
   * single approach, and the claim quietly went stale. These numbers record the
   * real state.
   *
   * They may FALL, never rise: new content must meet the standard, and each of
   * these is a concrete backlog item. Lower the number when you deepen one.
   */
  const DEPTH_DEBT = { singleApproach: 83, stepsWithoutVisual: 328 };

  it('explanation depth debt does not grow', async () => {
    const explanations = (await import('./playgroundExplanations')).playgroundExplanations;
    const VISUAL = ['array', 'map', 'stack', 'set', 'dualArray', 'callStack', 'linkedList',
      'timeline', 'computation', 'lookupOutcome', 'result', 'note'];

    let singleApproach = 0;
    let stepsWithoutVisual = 0;
    for (const ex of Object.values(explanations)) {
      if (ex.approaches.length < 2) singleApproach++;
      for (const a of ex.approaches) {
        for (const step of a.steps) {
          const s = step as unknown as Record<string, unknown>;
          if (!VISUAL.some((k) => s[k] !== undefined)) stepsWithoutVisual++;
        }
      }
    }
    expect(singleApproach).toBeLessThanOrEqual(DEPTH_DEBT.singleApproach);
    expect(stepsWithoutVisual).toBeLessThanOrEqual(DEPTH_DEBT.stepsWithoutVisual);
  });

  it('every approach carries the fields the modal renders', async () => {
    const explanations = (await import('./playgroundExplanations')).playgroundExplanations;
    const thin: string[] = [];
    for (const [name, ex] of Object.entries(explanations)) {
      for (const a of ex.approaches) {
        // An approach missing any of these renders an empty panel in the modal.
        if (!a.intuition || !a.complexity?.time || a.pseudocode.length === 0 || a.steps.length === 0) {
          thin.push(`${name}/${a.id}`);
        }
      }
    }
    expect(thin).toEqual([]);
  });

  it('every explanation is loadable with at least one approach and step', async () => {
    const explanations = (await import('./playgroundExplanations')).playgroundExplanations;
    for (const key of playgroundExplanationKeys) {
      const ex = explanations[key];
      expect(ex, key).toBeTruthy();
      expect(ex.approaches.length, key).toBeGreaterThan(0);
      for (const a of ex.approaches) {
        expect(a.steps.length, `${key} / ${a.name}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('filter dimensions the modal depends on', () => {
  it('pattern and difficulty appear only on JS challenges', () => {
    for (const t of fullTemplates) {
      if (t.kind === 'challenge' && t.tag === 'JS') continue;
      expect(t.patterns, t.name).toBeUndefined();
      expect(t.difficulty, t.name).toBeUndefined();
    }
  });

  it('every JS challenge carries a difficulty', () => {
    const missing = jsChallenges.filter((t) => !t.difficulty).map((t) => t.name);
    expect(missing).toEqual([]);
  });

  // Five JS challenges have carried no `patterns` since before the data was
  // split out of src/components/ — verified against the last commit, so this
  // is a content gap, not refactor damage. Pinning the exact set means the
  // gap cannot grow, while any of these gaining a pattern is a clean fix
  // (remove it from the list).
  const KNOWN_PATTERNLESS = [
    'Longest Common Prefix',
    'String to Integer (atoi)',
    'Product of Array Except Self',
    'Plus One',
    'Spiral Matrix',
  ];

  it('no JS challenge lacks a pattern beyond the five known ones', () => {
    const missing = jsChallenges.filter((t) => !t.patterns?.length).map((t) => t.name);
    expect(missing.filter((n) => !KNOWN_PATTERNLESS.includes(n))).toEqual([]);
  });

  it('the known-patternless list has no stale entries', () => {
    const missing = new Set(jsChallenges.filter((t) => !t.patterns?.length).map((t) => t.name));
    expect(KNOWN_PATTERNLESS.filter((n) => !missing.has(n)),
      'these now have patterns — remove them from KNOWN_PATTERNLESS').toEqual([]);
  });

  it('template names are unique — they key both lookup and saved progress', () => {
    const names = fullTemplates.map((t) => t.name);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});
